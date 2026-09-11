import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, ServerCrash, ShieldCheck, GraduationCap, BedDouble, Building2,
  Zap, Hammer, Calendar, MapPin, MessageSquare, ChevronDown, Users, History, Phone, Mail, UserPlus,
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Loader } from '../../components/Loader';
import { DonutChart } from '../../components/charts/DonutChart';
import type { DonutSegment } from '../../components/charts/DonutChart';
import { Meter } from '../../components/charts/Meter';
import { AssignAdminModal } from '../../components/AssignAdminModal';

// ── Types (mirror models/post.go + the Author selects in handlers/superadmin.go) ──

interface Comment {
  id: number;
  comment_text: string;
  email: string;
  role: string;
  created_at: string;
}

interface StatusAudit {
  event: string;
  timestamp: string;
}

interface Author {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  // faculty
  department?: string;
  house_number?: string;
  block?: string;
  type?: string;
  // warden
  hostel?: string;
  // centrehead
  building?: string;
}

interface Post {
  id: number;
  title: string;
  description: string;
  type_of_post: string;
  status: string;
  place?: string;
  room_number?: string;
  people_in_thread: string[] | null;
  status_audit_logs: StatusAudit[] | null;
  assigned_je_id: number | null;
  created_at: string;
  updated_at: string;
  comments: Comment[] | null;
  Author: Author;
}

type Source = 'faculty' | 'warden' | 'centrehead';

interface Section {
  key: Source;
  label: string;
  icon: React.ReactNode;
  endpoint: string;
}

const SECTIONS: Section[] = [
  { key: 'faculty',    label: 'Employee Posts',    icon: <GraduationCap className="w-4 h-4" />, endpoint: '/api/superadmin/posts/faculty' },
  { key: 'warden',     label: 'Warden Posts',      icon: <BedDouble className="w-4 h-4" />,     endpoint: '/api/superadmin/posts/warden' },
  { key: 'centrehead', label: 'Centre Head Posts', icon: <Building2 className="w-4 h-4" />,     endpoint: '/api/superadmin/posts/centreheads' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending_xen:  'bg-amber-50 text-amber-700 border-amber-200',
  pending_ae:   'bg-sky-50 text-sky-700 border-sky-200',
  resolved_ae:  'bg-teal-50 text-teal-700 border-teal-200',
  pending_je:   'bg-violet-50 text-violet-700 border-violet-200',
  resolved_je:  'bg-teal-50 text-teal-700 border-teal-200',
  resolved_all: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_FILTERS = ['pending_xen', 'pending_ae', 'resolved_ae', 'pending_je', 'resolved_je', 'resolved_all'];

const STATUS_LABELS: Record<string, string> = {
  pending_xen: 'Pending XEN',
  pending_ae: 'Pending AE',
  resolved_ae: 'Resolved AE',
  pending_je: 'Pending JE',
  resolved_je: 'Resolved JE',
  resolved_all: 'Resolved All',
};

const prettyStatus = (s: string) => STATUS_LABELS[s.toLowerCase()] ?? s.replace(/_/g, ' ');

// ── Chart palette (validated with the dataviz palette checker, light surface) ──

// Categorical slots 1-3: identity of the three sources. Fixed order, never cycled.
const SOURCE_COLORS: Record<Source, string> = {
  faculty: '#2a78d6',
  warden: '#eb6834',
  centrehead: '#1baf7a',
};

// Pipeline stages are ordered, so they take one hue stepped light→dark.
type Stage = 'xen' | 'ae' | 'je' | 'done';
const STAGES: { key: Stage; label: string; statuses: string[]; color: string }[] = [
  { key: 'xen',  label: 'With XEN',  statuses: ['pending_xen'],               color: '#86b6ef' },
  { key: 'ae',   label: 'With AE',   statuses: ['pending_ae', 'resolved_ae'], color: '#5598e7' },
  { key: 'je',   label: 'With JE',   statuses: ['pending_je', 'resolved_je'], color: '#2a78d6' },
  { key: 'done', label: 'Resolved',  statuses: ['resolved_all'],              color: '#0d366b' },
];
const stageOf = (status: string): Stage =>
  STAGES.find(st => st.statuses.includes(status.toLowerCase()))?.key ?? 'xen';

// Civil vs Electrical is a two-way split: one hue, fill on a same-ramp track.
const TYPE_FILL = '#2a78d6';
const TYPE_TRACK = '#b7d3f6';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

interface FetchError extends Error { status?: number }

interface PostsPage {
  posts: Post[];
  hasMore: boolean;
  nextOffset: number;
  total: number;
  /** Whole-table counts keyed by status, from the API. */
  statusCounts: Record<string, number>;
  /** Whole-table counts keyed by type_of_post, from the API. */
  typeCounts: Record<string, number>;
}

const asCounts = (v: unknown): Record<string, number> =>
  v && typeof v === 'object' ? (v as Record<string, number>) : {};

async function fetchPosts(endpoint: string, offset = 0): Promise<PostsPage> {
  const res = await fetch(`${endpoint}?offset=${offset}`, { credentials: 'include' });
  if (!res.ok) {
    let msg = `Server error (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch { /* not JSON */ }
    const err: FetchError = new Error(msg);
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  const posts: Post[] = Array.isArray(json.posts) ? json.posts : [];
  return {
    posts,
    hasMore: Boolean(json.has_more),
    nextOffset: typeof json.next_offset === 'number' ? json.next_offset : offset + posts.length,
    total: typeof json.total_posts === 'number' ? json.total_posts : offset + posts.length,
    statusCounts: asCounts(json.status_counts),
    typeCounts: asCounts(json.type_counts),
  };
}

// ── Author block ──────────────────────────────────────────────────────────────

function AuthorInfo({ author, source }: { author: Author | undefined; source: Source }) {
  if (!author) return <p className="text-xs text-gray-400 italic">Author details unavailable.</p>;

  const location =
    source === 'faculty'
      ? [author.department, author.house_number && `House ${author.house_number}`, author.block && `Block ${author.block}`, author.type && `Type ${author.type}`].filter(Boolean).join(' · ')
      : source === 'warden'
        ? author.hostel
        : author.building;

  return (
    <div className="text-xs text-gray-600 space-y-1">
      <p className="font-semibold text-gray-800">{author.name} <span className="font-mono text-gray-400">#{author.id}</span></p>
      <p className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400" />{author.email}</p>
      {author.phone_number && <p className="inline-flex items-center gap-1.5 ml-3"><Phone className="w-3 h-3 text-gray-400" />{author.phone_number}</p>}
      {location && <p className="inline-flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" />{location}</p>}
    </div>
  );
}

// ── Post card (expandable) ────────────────────────────────────────────────────

function PostCard({ post, source }: { post: Post; source: Source }) {
  const [open, setOpen] = useState(false);
  const isElectrical = post.type_of_post.toLowerCase() === 'electrical';
  const comments = post.comments ?? [];
  const audits = post.status_audit_logs ?? [];
  const people = post.people_in_thread ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">#{post.id}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-gray-50 text-gray-600 border-gray-200">
            {isElectrical ? <Zap className="w-2.5 h-2.5" /> : <Hammer className="w-2.5 h-2.5" />}
            {post.type_of_post}
          </span>
          <span className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded border ${STATUS_STYLES[post.status.toLowerCase()] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            {prettyStatus(post.status)}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>

        <h4 className="text-sm font-semibold text-gray-800 leading-snug">{post.title}</h4>
        {!open && <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>}

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
          <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{formatDate(post.created_at)}</span>
          {post.Author?.name && <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" />{post.Author.name}</span>}
          {post.place && <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" />{post.place}</span>}
          {post.room_number && <span className="inline-flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5 text-gray-400" />Room {post.room_number}</span>}
          {comments.length > 0 && <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-gray-400" />{comments.length}</span>}
          {post.assigned_je_id != null && <span className="font-mono">JE #{post.assigned_je_id}</span>}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-gray-100 p-4 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Description</h5>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.description}</p>
            <p className="text-[11px] text-gray-400 mt-2">Last updated {formatDate(post.updated_at)}</p>
          </div>

          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Author</h5>
            <AuthorInfo author={post.Author} source={source} />
          </div>

          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">People in thread</h5>
            {people.length === 0
              ? <p className="text-xs text-gray-400 italic">No one yet.</p>
              : <ul className="text-xs text-gray-600 space-y-0.5">{people.map(p => <li key={p}>{p}</li>)}</ul>}
          </div>

          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 inline-flex items-center gap-1.5"><History className="w-3 h-3" />Status history</h5>
            {audits.length === 0
              ? <p className="text-xs text-gray-400 italic">No status changes recorded.</p>
              : (
                <ol className="text-xs space-y-1.5 border-l border-gray-200 pl-3">
                  {audits.map((a, i) => (
                    <li key={i} className="text-gray-600">
                      <span className="font-semibold text-gray-800">{a.event.replace(/_/g, ' ')}</span>
                      <span className="text-gray-400 ml-2">{formatDate(a.timestamp)}</span>
                    </li>
                  ))}
                </ol>
              )}
          </div>

          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 inline-flex items-center gap-1.5"><MessageSquare className="w-3 h-3" />Comments ({comments.length})</h5>
            {comments.length === 0
              ? <p className="text-xs text-gray-400 italic">No comments.</p>
              : (
                <ul className="space-y-2">
                  {comments.map(c => (
                    <li key={c.id} className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] mb-1">
                        <span className="font-semibold text-gray-700">{c.email}</span>
                        <span className="uppercase tracking-wider text-gray-400 bg-white border border-gray-200 px-1.5 rounded">{c.role}</span>
                        <span className="ml-auto text-gray-400">{formatDate(c.created_at)}</span>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-wrap">{c.comment_text}</p>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section tile ──────────────────────────────────────────────────────────────

interface SectionTileProps {
  section: Section;
  posts: Post[];
  loaded: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

function SectionTile({ section, posts, loaded, total, hasMore, loadingMore, onLoadMore }: SectionTileProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <span className="text-gray-500">{section.icon}</span>
        <h3 className="text-sm font-bold text-gray-800 tracking-tight">{section.label}</h3>
        <span className="ml-auto text-xs text-gray-400">
          {posts.length !== loaded ? `${posts.length} shown · ` : ''}{loaded} of {total} loaded
        </span>
      </div>
      {posts.length === 0 ? (
        <div className="px-5 py-8 text-center text-xs text-gray-400 italic">No posts match this filter.</div>
      ) : (
        <div className="p-4 grid gap-4 lg:grid-cols-2">
          {posts.map(p => <PostCard key={p.id} post={p} source={section.key} />)}
        </div>
      )}
      {hasMore && (
        <div className="px-4 pb-4 flex justify-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-colors ${loadingMore ? 'opacity-70 cursor-not-allowed bg-white text-gray-500 border-gray-200' : 'bg-white text-gray-700 border-gray-300 hover:border-[#ff9900] hover:text-[#ff9900] cursor-pointer'}`}
          >
            {loadingMore && <Loader size="sm" color="orange" />}
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Insights ──────────────────────────────────────────────────────────────────

function StatTile({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-4 min-w-0">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="text-2xl font-extrabold text-gray-900 tabular-nums mt-1 leading-none">{value}</div>
      {hint && <div className="text-[11px] text-gray-400 mt-1.5">{hint}</div>}
    </div>
  );
}

interface InsightsProps {
  data: Record<Source, PostsPage>;
  activeSource: Source | 'all';
  onSourceSelect: (s: Source | 'all') => void;
  activeStage: Stage | null;
  onStageSelect: (s: Stage | null) => void;
}

function Insights({ data, activeSource, onSourceSelect, activeStage, onStageSelect }: InsightsProps) {
  const loaded = [...data.faculty.posts, ...data.warden.posts, ...data.centrehead.posts];
  const grandTotal = SECTIONS.reduce((a, s) => a + data[s.key].total, 0);
  const comments = loaded.reduce((a, p) => a + (p.comments?.length ?? 0), 0);

  // Whole-table counts, summed across the three sources.
  const sumCounts = (pick: (page: PostsPage) => Record<string, number>) => {
    const out: Record<string, number> = {};
    for (const s of SECTIONS) {
      for (const [k, v] of Object.entries(pick(data[s.key]))) {
        const key = k.toLowerCase();
        out[key] = (out[key] ?? 0) + v;
      }
    }
    return out;
  };
  const statusTotals = sumCounts(p => p.statusCounts);
  const typeTotals = sumCounts(p => p.typeCounts);
  const resolved = statusTotals['resolved_all'] ?? 0;

  const sourceSegments: DonutSegment[] = SECTIONS.map(s => ({
    key: s.key,
    label: s.label.replace(' Posts', ''),
    value: data[s.key].total,
    color: SOURCE_COLORS[s.key],
    detail: `${data[s.key].posts.length} loaded`,
  }));

  const stageSegments: DonutSegment[] = STAGES.map(st => {
    const count = (status: string) => statusTotals[status] ?? 0;
    const value = st.statuses.reduce((a, status) => a + count(status), 0);
    const pending = st.statuses.filter(x => x.startsWith('pending')).reduce((a, status) => a + count(status), 0);
    const detail = st.statuses.length > 1 ? `${pending} pending · ${value - pending} resolved` : undefined;
    return { key: st.key, label: st.label, value, color: st.color, detail };
  });

  const civil = typeTotals['civil'] ?? 0;
  const electrical = typeTotals['electrical'] ?? 0;

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total complaints" value={grandTotal} hint="across all sources" />
        <StatTile label="Loaded on this page" value={loaded.length} hint={`${Math.round(grandTotal ? (loaded.length / grandTotal) * 100 : 0)}% of total`} />
        <StatTile label="Fully resolved" value={resolved} hint={`${grandTotal - resolved} still in pipeline`} />
        <StatTile label="Comments" value={comments} hint="on loaded complaints" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[1fr_1fr_minmax(16rem,0.7fr)]">
        <DonutChart
          title="Complaints by source"
          caption="Every complaint on record, by who raised it."
          segments={sourceSegments}
          centreLabel="complaints"
          selected={activeSource === 'all' ? null : activeSource}
          onSelect={key => onSourceSelect((key as Source | null) ?? 'all')}
        />
        <DonutChart
          title="Where complaints sit in the pipeline"
          caption="Every complaint on record, by the desk currently holding it."
          segments={stageSegments}
          centreLabel="complaints"
          selected={activeStage}
          onSelect={key => onStageSelect(key as Stage | null)}
        />
        <Meter
          title="Civil vs Electrical"
          caption="Every complaint on record, by works category."
          a={{ label: 'Civil', value: civil, color: TYPE_FILL }}
          b={{ label: 'Electrical', value: electrical, color: TYPE_TRACK }}
        />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SuperAdminDashboard() {
  const [data, setData] = useState<Record<Source, PostsPage> | null>(null);
  const [loadingMore, setLoadingMore] = useState<Source | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSource, setActiveSource] = useState<Source | 'all'>('all');
  const [activeStage, setActiveStage] = useState<Stage | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all(SECTIONS.map(s => fetchPosts(s.endpoint)))
      .then(([faculty, warden, centrehead]) => {
        setData({ faculty, warden, centrehead });
        setLoading(false);
      })
      .catch((err: FetchError) => {
        setError({ message: err.message, status: err.status });
        setLoading(false);
        if (err.status === 401 || err.status === 403) {
          setTimeout(() => navigate('/superadmin/login'), 4000);
        }
      });
  }, [navigate]);

  const loadMore = async (source: Source) => {
    if (!data || loadingMore) return;
    const section = SECTIONS.find(s => s.key === source)!;
    setLoadingMore(source);
    try {
      const page = await fetchPosts(section.endpoint, data[source].nextOffset);
      setData(prev => prev ? {
        ...prev,
        [source]: {
          posts: [...prev[source].posts, ...page.posts],
          hasMore: page.hasMore,
          nextOffset: page.nextOffset,
          total: page.total,
          statusCounts: page.statusCounts,
          typeCounts: page.typeCounts,
        },
      } : prev);
    } catch (err) {
      const e = err as FetchError;
      setError({ message: e.message, status: e.status });
    } finally {
      setLoadingMore(null);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-20">
          <div className="text-center">
            <Loader size="lg" color="orange" className="mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Fetching all posts…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    const isAuthError = error.status === 401 || error.status === 403;
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-20">
          <div className={`max-w-md w-full mx-4 bg-white rounded-xl p-6 shadow-md text-center border ${isAuthError ? 'border-red-200' : 'border-gray-200'}`}>
            {isAuthError
              ? <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              : <ServerCrash className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
            <h3 className="text-lg font-bold text-gray-800 mb-2">{isAuthError ? 'Access Denied' : 'Could Not Load Posts'}</h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            {isAuthError
              ? <p className="text-xs text-gray-500">Redirecting to super admin login…</p>
              : <button onClick={() => window.location.reload()} className="text-xs font-bold text-[#ff9900] hover:underline cursor-pointer">Try again →</button>}
          </div>
        </div>
      </MainLayout>
    );
  }

  const all = [...data!.faculty.posts, ...data!.warden.posts, ...data!.centrehead.posts];
  const applyFilter = (posts: Post[]) =>
    posts.filter(p =>
      (activeFilter === 'All' || p.status.toLowerCase() === activeFilter) &&
      (activeStage === null || stageOf(p.status) === activeStage));
  const count = (status: string) =>
    status === 'All' ? all.length : all.filter(p => p.status.toLowerCase() === status).length;
  const visibleSections = SECTIONS.filter(s => activeSource === 'all' || s.key === activeSource);

  return (
    <MainLayout>
      <div className="flex-grow bg-gray-50 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="px-6 relative z-10">
          <div className="mb-8 pb-4 border-b border-gray-200 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <ShieldCheck className="w-6 h-6 text-[#ff9900]" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Super Admin Dashboard</h2>
              </div>
              <p className="text-sm text-gray-500">
                Read-only view of every complaint, with author details, status history, and comments.
              </p>
            </div>
            <button
              onClick={() => setAssignOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#222222] hover:bg-[#111111] text-white transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Assign super admin
            </button>
          </div>

          <AssignAdminModal open={assignOpen} onClose={() => setAssignOpen(false)} />

          <Insights
            data={data!}
            activeSource={activeSource}
            onSourceSelect={setActiveSource}
            activeStage={activeStage}
            onStageSelect={setActiveStage}
          />

          {/* Source tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {([{ key: 'all', label: 'All sources' }, ...SECTIONS] as { key: Source | 'all'; label: string }[]).map(s => {
              const isActive = activeSource === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSource(s.key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${isActive ? 'bg-[#222222] text-white border-[#222222]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          {/* Status filter chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            {['All', ...STATUS_FILTERS].map(status => {
              const isActive = activeFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${isActive ? 'bg-[#ff9900] text-white border-[#ff9900]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#ff9900]/50'}`}
                >
                  {status === 'All' ? 'All' : prettyStatus(status)}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count(status)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-6">
            {visibleSections.map(s => (
              <SectionTile
                key={s.key}
                section={s}
                posts={applyFilter(data![s.key].posts)}
                loaded={data![s.key].posts.length}
                total={data![s.key].total}
                hasMore={data![s.key].hasMore}
                loadingMore={loadingMore === s.key}
                onLoadMore={() => loadMore(s.key)}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
