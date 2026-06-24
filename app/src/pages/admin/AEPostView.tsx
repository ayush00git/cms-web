import { useEffect, useMemo, useState } from 'react';
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

interface AEPostsResponse {
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

const STATUS_STYLES: Record<string, string> = {
  pending_xen:  'bg-amber-50 text-amber-700',
  pending_ae:   'bg-blue-50 text-blue-700',
  resolved_ae:  'bg-teal-50 text-teal-700',
  pending_je:   'bg-indigo-50 text-indigo-700',
  resolved_je:  'bg-teal-50 text-teal-700',
  resolved_all: 'bg-emerald-50 text-emerald-700',
};

// Active-chip colours for the filter bar, derived from STATUS_STYLES.
const FILTER_ACTIVE_STYLES: Record<string, string> = {
  All:          'bg-[#ff9900] text-white border-[#ff9900]',
  pending_xen:  'bg-amber-500 text-white border-amber-500',
  pending_ae:   'bg-blue-500 text-white border-blue-500',
  resolved_ae:  'bg-teal-500 text-white border-teal-500',
  pending_je:   'bg-indigo-500 text-white border-indigo-500',
  resolved_je:  'bg-teal-500 text-white border-teal-500',
  resolved_all: 'bg-emerald-500 text-white border-emerald-500',
};

const STATUS_FILTERS = [
  'All',
  'resolved_ae',
  'resolved_je',
  'pending_ae',
  'pending_je',
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

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

interface PostTileProps {
  label: string;
  icon: React.ReactNode;
  role: string;
  posts: PostRow[];
}

function PostTile({ label, icon, role, posts }: PostTileProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Tile header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <span className="text-gray-500">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800 tracking-tight">{label}</h3>
        <span className="ml-auto bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
          {posts.length}
        </span>
      </div>

      {/* Card grid */}
      {posts.length === 0 ? (
        <div className="px-5 py-8 text-center text-xs text-gray-400 italic">
          No complaints at the moment.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {posts.map((post) => {
            const isElectrical = post.type_of_post.toLowerCase() === 'electrical';
            return (
              <Link
                key={post.id}
                to={`/admin/posts/${role}/${post.id}`}
                className="group flex flex-col gap-3 bg-gray-100 hover:bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-[#ff9900]/50 transition-all cursor-pointer"
              >
                {/* Top row: id + type */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    #{post.id}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {isElectrical ? <Zap className="w-3 h-3" /> : <Hammer className="w-3 h-3" />}
                    {post.type_of_post}
                  </span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-gray-900">
                  {post.title}
                </p>

                {/* Status badge */}
                <span className={`self-start text-[11px] font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[post.status.toLowerCase()] ?? 'bg-gray-100 text-gray-500'}`}>
                  {prettyStatus(post.status)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

interface FetchError extends Error {
  status?: number;
}

export function AEPostView() {
  const [data, setData] = useState<AEPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin/ae/posts', { credentials: 'include' })
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
      .then((json: AEPostsResponse) => {
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

  // Derive the three sections + per-status counts. Kept above the early returns
  // (and memoised on `data`) so the hook order stays stable across renders.
  const { facultyPosts, wardenPosts, centreheadPosts, statusCounts } = useMemo(() => {
    const faculty    = normalise(data?.faculty_posts);
    const warden     = normalise(data?.warden_posts);
    const centrehead = normalise(data?.centrehead_posts);
    const all = [...faculty, ...warden, ...centrehead];
    const counts: Record<string, number> = { All: all.length };
    for (const post of all) {
      const statusNorm = post.status.toLowerCase();
      counts[statusNorm] = (counts[statusNorm] ?? 0) + 1;
    }
    return { facultyPosts: faculty, wardenPosts: warden, centreheadPosts: centrehead, statusCounts: counts };
  }, [data]);

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

  const matchesFilter = (post: PostRow) => {
    if (activeFilter === 'All') return true;
    return post.status.toLowerCase() === activeFilter.toLowerCase();
  };

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
                AE Post Dashboard
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Complaints assigned at the AE level — Faculty, Warden, and Centre Head.
            </p>
          </div>

          {/* Status filter bar */}
          <div className="mb-8 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => {
              const isActive = activeFilter === status;
              const count = statusCounts[status] ?? 0;
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    isActive
                      ? FILTER_ACTIVE_STYLES[status]
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {status === 'All' ? 'All' : prettyStatus(status)}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tiles — stacked vertically, full-width */}
          <div className="flex flex-col gap-6">
            <PostTile
              label="Faculty Posts"
              icon={<GraduationCap className="w-4 h-4" />}
              role="faculty"
              posts={facultyPosts.filter(matchesFilter)}
            />

            <PostTile
              label="Warden Posts"
              icon={<BedDouble className="w-4 h-4" />}
              role="warden"
              posts={wardenPosts.filter(matchesFilter)}
            />

            <PostTile
              label="Centre Head Posts"
              icon={<Building2 className="w-4 h-4" />}
              role="centrehead"
              posts={centreheadPosts.filter(matchesFilter)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
