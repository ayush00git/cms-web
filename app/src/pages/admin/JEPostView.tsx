import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ServerCrash, ClipboardList, GraduationCap, BedDouble, Building2, Zap, Hammer } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BasePost {
  id: number;
  title: string;
  type_of_post: string;
  status: string;
}

interface JEPostsResponse {
  success: string;
  faculty_posts: BasePost[] | BasePost | null;
  warden_posts: BasePost[] | BasePost | null;
  centrehead_posts: BasePost[] | BasePost | null;
}

function normalise(val: BasePost[] | BasePost | null | undefined): BasePost[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// ── Post List Tile ─────────────────────────────────────────────────────────────

interface PostRow {
  id: number;
  title: string;
  type_of_post: string;
  status: string;
}

// Badge styles per status. `badge` colours the status pill, `dot` colours the
// small status indicator on each card (and the filter chip dot).
const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  pending_xen:  { badge: 'bg-amber-50 text-amber-700',     dot: 'bg-amber-500' },
  pending_ae:   { badge: 'bg-blue-50 text-blue-700',       dot: 'bg-blue-500' },
  resolved_ae:  { badge: 'bg-teal-50 text-teal-700',       dot: 'bg-teal-500' },
  pending_je:   { badge: 'bg-indigo-50 text-indigo-700',   dot: 'bg-indigo-500' },
  resolved_je:  { badge: 'bg-teal-50 text-teal-700',       dot: 'bg-teal-500' },
  resolved_all: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
};

const FALLBACK_STYLE = { badge: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' };

const prettyStatus = (s: string) => {
  const norm = s.toLowerCase();
  if (norm === 'pending_xen') return 'Pending XEN';
  if (norm === 'pending_ae') return 'Pending AE';
  if (norm === 'resolved_ae') return 'Resolved AE';
  if (norm === 'pending_je') return 'Pending JE';
  if (norm === 'resolved_je') return 'Resolved JE';
  if (norm === 'resolved_all') return 'Resolved All';
  return s.replace('_', ' ');
};

// A complaint card — clickable tile in the responsive grid.
function PostCard({ post, role }: { post: PostRow; role: string }) {
  const norm = post.status.toLowerCase();
  const style = STATUS_STYLES[norm] ?? STATUS_STYLES[post.status] ?? FALLBACK_STYLE;
  const isElectrical = post.type_of_post.toLowerCase() === 'electrical';

  return (
    <Link
      to={`/admin/posts/${role}/${post.id}`}
      className="group flex flex-col gap-3 bg-gray-100 hover:bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#ff9900]/40 transition-all cursor-pointer"
    >
      {/* Top row — ID + type badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
          #{post.id}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {isElectrical ? <Zap className="w-3 h-3" /> : <Hammer className="w-3 h-3" />}
          {post.type_of_post}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-gray-900">
        {post.title}
      </p>

      {/* Status badge */}
      <span className={`mt-auto inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded ${style.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {prettyStatus(post.status)}
      </span>
    </Link>
  );
}

interface PostTileProps {
  label: string;
  icon: React.ReactNode;
  role: string;
  posts: PostRow[];
}

function PostTile({ label, icon, role, posts }: PostTileProps) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-gray-500">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800 tracking-tight">{label}</h3>
        <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
          {posts.length}
        </span>
      </div>

      {/* Card grid */}
      {posts.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl px-5 py-8 text-center text-xs text-gray-400 italic">
          No complaints at the moment.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} role={role} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Status Filter ────────────────────────────────────────────────────────────

// Selectable statuses (in workflow order) plus their human-readable labels.
const FILTERS: { value: string; label: string }[] = [
  { value: 'All',          label: 'All' },
  { value: 'pending_xen',  label: 'Pending XEN' },
  { value: 'pending_ae',   label: 'Pending AE' },
  { value: 'resolved_ae',  label: 'Resolved AE' },
  { value: 'pending_je',   label: 'Pending JE' },
  { value: 'resolved_je',  label: 'Resolved JE' },
  { value: 'resolved_all', label: 'Resolved All' },
];

// ── Main Page ──────────────────────────────────────────────────────────────────

interface FetchError extends Error {
  status?: number;
}

export function JEPostView() {
  const [data, setData] = useState<JEPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin/je/posts', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          let msg = `Server error (${res.status})`;
          try {
            const body = await res.json();
            if (body?.error) msg = body.error;
          } catch { /* body wasn't JSON — keep the default msg */ }

          const err: FetchError = new Error(msg);
          err.status = res.status;
          throw err;
        }
        return res.json();
      })
      .then((json: JEPostsResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: FetchError) => {
        setError({ message: err.message, status: err.status });
        setLoading(false);
        if (err.status === 401 || err.status === 403) {
          setTimeout(() => navigate('/'), 4000);
        }
      });
  }, [navigate]);

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Fetching posts…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Error ──
  if (error) {
    const isAuthError = error.status === 401 || error.status === 403;
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-20">
          <div className={`max-w-md w-full mx-4 bg-white rounded-xl p-6 shadow-md text-center border ${isAuthError ? 'border-red-200' : 'border-gray-200'}`}>
            {isAuthError
              ? <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              : <ServerCrash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            }
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {isAuthError ? 'Access Denied' : 'Could Not Load Posts'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            {isAuthError
              ? <p className="text-xs text-gray-500">Redirecting to Homepage…</p>
              : (
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs font-bold text-[#ff9900] hover:underline cursor-pointer"
                >
                  Try again →
                </button>
              )
            }
          </div>
        </div>
      </MainLayout>
    );
  }

  const { faculty_posts: fp, warden_posts: wp, centrehead_posts: cp } = data!;

  // Normalise once, then apply the active status filter across all sections.
  const faculty = normalise(fp);
  const warden = normalise(wp);
  const centrehead = normalise(cp);

  const byFilter = (posts: PostRow[]) =>
    filter === 'All' ? posts : posts.filter((p) => p.status.toLowerCase() === filter.toLowerCase());

  // Per-status counts across all three sections — shown on each filter chip.
  const counts = (() => {
    const all = [...faculty, ...warden, ...centrehead];
    const map: Record<string, number> = { All: all.length };
    for (const p of all) {
      const statusNorm = p.status.toLowerCase();
      map[statusNorm] = (map[statusNorm] ?? 0) + 1;
    }
    return map;
  })();

  return (
    <MainLayout>
      <div className="flex-grow bg-gray-50 py-12 relative overflow-hidden">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="px-6 relative z-10">
          {/* Page header */}
          <div className="mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-1">
              <ClipboardList className="w-6 h-6 text-[#ff9900]" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                JE Post Dashboard
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Complaints assigned at the JE level — Faculty, Warden, and Centre Head.
            </p>
          </div>

          {/* Status filter bar */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map(({ value, label }) => {
              const active = filter === value;
              const dot = STATUS_STYLES[value]?.dot;
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#ff9900] text-white border-[#ff9900]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {dot && <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : dot}`} />}
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {counts[value] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sections — each a responsive card grid */}
          <div className="flex flex-col gap-10">
            <PostTile
              label="Faculty Posts"
              icon={<GraduationCap className="w-4 h-4" />}
              role="faculty"
              posts={byFilter(faculty)}
            />

            <PostTile
              label="Warden Posts"
              icon={<BedDouble className="w-4 h-4" />}
              role="warden"
              posts={byFilter(warden)}
            />

            <PostTile
              label="Centre Head Posts"
              icon={<Building2 className="w-4 h-4" />}
              role="centrehead"
              posts={byFilter(centrehead)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
