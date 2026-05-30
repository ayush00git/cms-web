import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ServerCrash, ClipboardList, GraduationCap, BedDouble, Building2 } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BasePost {
  id: number;
  title: string;
  type_of_post: string;
  status: string;
}

interface XENPostsResponse {
  success: string;
  // API may return an array, a single object, or null depending on the backend
  faculty_posts: BasePost[] | BasePost | null;
  warden_posts: BasePost[] | BasePost | null;
  centrehead_posts: BasePost[] | BasePost | null;
}

// Handles every shape the Go backend might send:
//   null / undefined  →  []
//   single object     →  [object]
//   array             →  array (as-is)
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
  Pending_XEN: 'bg-amber-50 text-amber-700',
  Pending_AE:  'bg-blue-50 text-blue-700',
  Pending_JE:  'bg-indigo-50 text-indigo-700',
  Resolved_JE: 'bg-teal-50 text-teal-700',
  Resolved:    'bg-emerald-50 text-emerald-700',
  Closed:      'bg-red-50 text-red-600',
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

      {/* List */}
      {posts.length === 0 ? (
        <div className="px-5 py-8 text-center text-xs text-gray-400 italic">
          No complaints at the moment.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {posts.map((post) => (
            <li key={post.id}>
            <Link
              to={`/admin/xen/posts/${role}/${post.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* ID chip */}
              <span className="shrink-0 text-[11px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                #{post.id}
              </span>
              {/* Title */}
              <span className="text-sm font-medium text-gray-800 truncate flex-1">{post.title}</span>
              {/* Type badge */}
              <span className="shrink-0 text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {post.type_of_post}
              </span>
              {/* Status badge */}
              <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[post.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {post.status.replace('_', ' ')}
              </span>
            </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

// Augmented error so the catch block knows the HTTP status
interface FetchError extends Error {
  status?: number;
}

export function XENPostView() {
  const [data, setData] = useState<XENPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin/xen/posts', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          // Try to read the actual error message from the API body
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
      .then((json: XENPostsResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch((err: FetchError) => {
        setError({ message: err.message, status: err.status });
        setLoading(false);
        // Only redirect home on actual auth rejections
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
                XEN Post Dashboard
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              Incoming complaints routed through the XEN pipeline — Faculty, Warden, and Centre Head.
            </p>
          </div>

          {/* Tiles — stacked vertically, full-width */}
          <div className="flex flex-col gap-6">
            <PostTile
              label="Faculty Posts"
              icon={<GraduationCap className="w-4 h-4" />}
              role="faculty"
              posts={normalise(fp)}
            />

            <PostTile
              label="Warden Posts"
              icon={<BedDouble className="w-4 h-4" />}
              role="warden"
              posts={normalise(wp)}
            />

            <PostTile
              label="Centre Head Posts"
              icon={<Building2 className="w-4 h-4" />}
              role="centrehead"
              posts={normalise(cp)}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
