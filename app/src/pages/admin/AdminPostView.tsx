import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  ServerCrash,
  ArrowLeft,
  FileText,
  User,
  MapPin,
  BedDouble,
  Building2,
  Phone,
  Mail,
  Hash,
  Calendar,
  Zap,
  Hammer,
  MessageSquare,
  GraduationCap,
  BookOpen,
  Home,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCcw,
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';

// ── Types ──────────────────────────────────────────────────────────────────────

interface FacultyAuthor {
  id: number;
  email: string;
  name: string;
  house_number: string;
  department: string;
  phone_number: string;
  block: string;
  type: string;
}

interface WardenAuthor {
  id: number;
  email: string;
  hostel: string;
  phone_number: string;
}

interface CentreHeadAuthor {
  id: number;
  email: string;
  building: string;
  phone_number: string;
}

interface CommentAuthor {
  id: number;
  email: string;
  position: string;
}

interface Comment {
  id: number;
  comment_text: string;
  author_id: number;
  Author?: CommentAuthor;
  created_at: string;
}

interface FacultyPost {
  id: number;
  faculty_id: number;
  Author: FacultyAuthor;
  place: string;
  type_of_post: string;
  title: string;
  description: string;
  status: string;
  stage: string;
  assigned_je_id: number | null;
  created_at: string;
  updated_at: string;
  comments: Comment[] | null;
}

interface WardenPost {
  id: number;
  warden_id: number;
  Author: WardenAuthor;
  room_number: string;
  type_of_post: string;
  title: string;
  description: string;
  status: string;
  stage: string;
  assigned_je_id: number | null;
  created_at: string;
  updated_at: string;
  comments: Comment[] | null;
}

interface CentreHeadPost {
  id: number;
  centre_head_id: number;
  Author: CentreHeadAuthor;
  type_of_post: string;
  title: string;
  description: string;
  status: string;
  stage: string;
  assigned_je_id: number | null;
  created_at: string;
  updated_at: string;
  comments: Comment[] | null;
}

type Post = FacultyPost | WardenPost | CentreHeadPost;

interface ApiResponse {
  success: string;
  post: Post;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  Pending_XEN: 'bg-amber-50 text-amber-700 border-amber-200',
  Pending_AE:  'bg-blue-50 text-blue-700 border-blue-200',
  Pending_JE:  'bg-indigo-50 text-indigo-700 border-indigo-200',
  Resolved_JE: 'bg-teal-50 text-teal-700 border-teal-200',
  Resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed:      'bg-red-50 text-red-600 border-red-200',
};

// Maps URL role param → API segment for the status endpoint
const ROLE_TO_STATUS_API: Record<string, string> = {
  faculty:    'faculty_posts',
  warden:     'warden_posts',
  centrehead: 'centre_head_posts',
};

// Maps URL role param → API segment for the comment endpoint
const ROLE_TO_COMMENT_API: Record<string, string> = {
  faculty:    'faculty_posts',
  warden:     'wardens_posts',
  centrehead: 'centreheads_posts',
};

// Back-link per admin type
const ADMIN_BACK: Record<string, string> = {
  xen: '/admin/xen',
  ae:  '/admin/ae',
  je:  '/admin/je',
};

// ── Action button definitions ──────────────────────────────────────────────────

interface ActionButton {
  label: string;
  review: string;
  icon: React.ReactNode;
}

// Buttons derived directly from handler logic in admin_status.go
function getActionButtons(adminType: string, status: string): ActionButton[] {
  if (adminType === 'xen') {
    if (status === 'Pending_XEN') return [
      { label: 'Send to AE', review: 'to_ae', icon: <ChevronRight className="w-3.5 h-3.5" /> },
      { label: 'Close Post',  review: 'close',  icon: <XCircle      className="w-3.5 h-3.5" /> },
    ];
    if (status === 'Closed') return [
      { label: 'Reopen Post', review: 'open', icon: <RefreshCcw className="w-3.5 h-3.5" /> },
    ];
  }
  if (adminType === 'ae') {
    if (status === 'Pending_AE') return [
      { label: 'Assign to JE',    review: 'to_je',          icon: <ChevronRight className="w-3.5 h-3.5" /> },
      { label: 'Escalate to XEN', review: 'require_review',  icon: <RefreshCcw   className="w-3.5 h-3.5" /> },
    ];
  }
  if (adminType === 'je') {
    if (status === 'Pending_JE') return [
      { label: 'Mark Resolved',  review: 'resolved',        icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
      { label: 'Escalate to AE', review: 'require_review',  icon: <RefreshCcw   className="w-3.5 h-3.5" /> },
    ];
  }
  return [];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function AdminPostView() {
  const { adminType, role, post_id } = useParams<{ adminType: string; role: string; post_id: string }>();
  const navigate = useNavigate();

  const [post, setPost]     = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<{ message: string; status?: number } | null>(null);

  // Combined comment + status action state
  const [commentText, setCommentText] = useState('');
  const [acting, setActing]           = useState(false);
  const [actError, setActError]       = useState<string | null>(null);
  const [actSuccess, setActSuccess]   = useState<string | null>(null);
  const actTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPost = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    fetch(`/api/admin/posts/${role}/${post_id}`, { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) {
          let msg = `Server error (${res.status})`;
          try { const b = await res.json(); if (b?.error) msg = b.error; } catch {}
          const err: Error & { status?: number } = new Error(msg);
          err.status = res.status;
          throw err;
        }
        return res.json();
      })
      .then((json: ApiResponse) => {
        setPost(json.post);
        if (!silent) setLoading(false);
      })
      .catch((err: Error & { status?: number }) => {
        if (!silent) {
          setError({ message: err.message, status: err.status });
          setLoading(false);
          if (err.status === 401 || err.status === 403) setTimeout(() => navigate('/'), 4000);
        }
      });
  }, [role, post_id, navigate]);

  useEffect(() => { fetchPost(); }, [fetchPost]);
  useEffect(() => () => { if (actTimer.current) clearTimeout(actTimer.current); }, []);

  // ── Combined handler: post comment THEN update status ──
  async function handleAction(review: string) {
    const trimmed = commentText.trim();
    if (!trimmed) return; // guard — buttons are disabled too, but just in case

    const commentApi = ROLE_TO_COMMENT_API[role ?? ''];
    const statusApi  = ROLE_TO_STATUS_API[role ?? ''];
    if (!commentApi || !statusApi) {
      setActError('Unknown post type.');
      return;
    }

    setActing(true);
    setActError(null);
    setActSuccess(null);

    try {
      // 1. Post the comment first
      const commentRes = await fetch(`/api/admin/comment/${commentApi}/${post_id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Content: trimmed }),
      });
      if (!commentRes.ok) {
        let msg = `Failed to post comment (${commentRes.status})`;
        try { const b = await commentRes.json(); if (b?.error) msg = b.error; } catch {}
        throw new Error(msg);
      }

      // 2. Update status
      const statusRes = await fetch(`/api/admin/${statusApi}/status/${post_id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Review: review }),
      });
      if (!statusRes.ok) {
        let msg = `Comment posted but status update failed (${statusRes.status})`;
        try { const b = await statusRes.json(); if (b?.error) msg = b.error; } catch {}
        throw new Error(msg);
      }

      setCommentText('');
      setActSuccess('Comment posted & status updated!');
      if (actTimer.current) clearTimeout(actTimer.current);
      actTimer.current = setTimeout(() => setActSuccess(null), 3000);
      fetchPost(true);
    } catch (err) {
      setActError((err as Error).message);
    } finally {
      setActing(false);
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#ff9900] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Loading post…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Error ──
  if (error) {
    const isAuth = error.status === 401 || error.status === 403;
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-gray-50 py-20">
          <div className={`max-w-md w-full mx-4 bg-white rounded-xl p-6 shadow-md text-center border ${isAuth ? 'border-red-200' : 'border-gray-200'}`}>
            {isAuth
              ? <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              : <ServerCrash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            }
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {isAuth ? 'Access Denied' : 'Could Not Load Post'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            {isAuth
              ? <p className="text-xs text-gray-500">Redirecting…</p>
              : <button onClick={() => navigate(-1)} className="text-xs font-bold text-[#ff9900] hover:underline cursor-pointer">← Go back</button>
            }
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!post) return null;

  // ── Derive role-specific fields ──
  const isFaculty    = role === 'faculty';
  const isWarden     = role === 'warden';
  const isCentrehead = role === 'centrehead';

  const fp = isFaculty    ? (post as FacultyPost)    : null;
  const wp = isWarden     ? (post as WardenPost)      : null;
  const cp = isCentrehead ? (post as CentreHeadPost)  : null;

  const comments   = post.comments ?? [];
  const roleLabel  = isFaculty ? 'Faculty' : isWarden ? 'Warden' : 'Centre Head';
  const RoleIcon   = isFaculty ? GraduationCap : isWarden ? BedDouble : Building2;
  const statusCls  = STATUS_STYLES[post.status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const backPath   = ADMIN_BACK[adminType ?? ''] ?? '/';
  const actionBtns = getActionButtons(adminType ?? '', post.status);
  const canAct     = actionBtns.length > 0;
  const disabled   = acting || !commentText.trim();

  return (
    <MainLayout>
      <div className="flex-grow bg-gray-50 py-10 relative overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="px-6 relative z-10">

          {/* Back + breadcrumb */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              to={backPath}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-400 font-mono">#{post.id} · {roleLabel}</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── Left: post detail + comments (2/3) ── */}
            <div className="xl:col-span-2 flex flex-col gap-6">

              {/* Title card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-[#2d2d2d] px-6 py-5">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 bg-white/10 px-2.5 py-1 rounded-full">
                      <RoleIcon className="w-3.5 h-3.5" /> {roleLabel} Complaint
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-300 bg-white/10 px-2.5 py-1 rounded-full">
                      {post.type_of_post === 'Electrical'
                        ? <Zap className="w-3.5 h-3.5" />
                        : <Hammer className="w-3.5 h-3.5" />
                      }
                      {post.type_of_post}
                    </span>
                  </div>
                  <h1 className="text-xl font-extrabold text-white leading-snug">{post.title}</h1>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusCls}`}>
                      {post.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Stage: {post.stage}</span>
                    {post.assigned_je_id && (
                      <span className="text-xs text-gray-400 font-mono">JE #{post.assigned_je_id}</span>
                    )}
                    <span className="ml-auto text-xs text-gray-400">Post #{post.id}</span>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Description
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{post.description}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-5 border-t border-gray-100">
                    {fp && (
                      <MetaRow icon={<MapPin className="w-4 h-4" />} label="Area" value={fp.place} />
                    )}
                    {wp && (
                      <MetaRow icon={<BedDouble className="w-4 h-4" />} label="Room" value={wp.room_number} />
                    )}
                    <MetaRow icon={<Calendar className="w-4 h-4" />} label="Filed On"     value={formatDate(post.created_at)} />
                    <MetaRow icon={<Calendar className="w-4 h-4" />} label="Last Updated" value={formatDate(post.updated_at)} />
                    <MetaRow icon={<Hash className="w-4 h-4" />}     label="Post ID"      value={`#${post.id}`} />
                  </div>
                </div>
              </div>

              {/* ── Comments + action card ── */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  Comments
                  <span className="ml-auto bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                </h3>

                {/* Comment list */}
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-6">No comments yet.</p>
                ) : (
                  <ul className="space-y-2 mb-6">
                    {comments.map((c) => (
                      <li key={c.id} className="flex flex-col gap-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-gray-700">
                            {c.Author?.position ? c.Author.position.replace(/_/g, ' ') : `Admin #${c.author_id}`}
                          </span>
                          <span className="text-[11px] text-gray-400">{formatDateTime(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{c.comment_text}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {/* ── Comment + action area (only when this admin has applicable actions) ── */}
                {canAct && (
                  <div className={`pt-4 ${comments.length > 0 ? 'border-t border-gray-100' : ''}`}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Comment &amp; Update Status
                    </label>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={acting}
                      placeholder="Add a comment before updating the status…"
                      rows={3}
                      className="w-full text-sm text-gray-800 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff9900]/40 focus:border-[#ff9900] transition disabled:opacity-50"
                    />

                    {/* Feedback */}
                    {actError && (
                      <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {actError}
                      </p>
                    )}
                    {actSuccess && (
                      <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        {actSuccess}
                      </p>
                    )}

                    {/* Action buttons — same dark-gray, side by side with each other */}
                    <div className="mt-3 flex flex-wrap justify-end gap-2">
                      {actionBtns.map((btn) => (
                        <button
                          key={btn.review}
                          onClick={() => handleAction(btn.review)}
                          disabled={disabled}
                          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#2d2d2d] hover:bg-[#ff9900] px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {acting ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : btn.icon}
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: author info (1/3) ── */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 h-fit">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                <User className="w-4 h-4 text-gray-400" /> Filed By
              </h3>

              <div className="flex flex-col gap-4">
                {fp && fp.Author && (
                  <>
                    <MetaRow icon={<User className="w-4 h-4" />}       label="Name"       value={fp.Author.name} />
                    <MetaRow icon={<Mail className="w-4 h-4" />}       label="Email"      value={fp.Author.email} />
                    <MetaRow icon={<Phone className="w-4 h-4" />}      label="Phone"      value={fp.Author.phone_number} />
                    <MetaRow icon={<BookOpen className="w-4 h-4" />}   label="Department" value={fp.Author.department} />
                    <MetaRow icon={<Home className="w-4 h-4" />}       label="Residence"  value={`House ${fp.Author.house_number}, Block ${fp.Author.block} (Type ${fp.Author.type})`} />
                  </>
                )}
                {wp && wp.Author && (
                  <>
                    <MetaRow icon={<Mail className="w-4 h-4" />}       label="Email"  value={wp.Author.email} />
                    <MetaRow icon={<Phone className="w-4 h-4" />}      label="Phone"  value={wp.Author.phone_number} />
                    <MetaRow icon={<BedDouble className="w-4 h-4" />}  label="Hostel" value={wp.Author.hostel} />
                  </>
                )}
                {cp && cp.Author && (
                  <>
                    <MetaRow icon={<Mail className="w-4 h-4" />}      label="Email"    value={cp.Author.email} />
                    <MetaRow icon={<Phone className="w-4 h-4" />}     label="Phone"    value={cp.Author.phone_number} />
                    <MetaRow icon={<Building2 className="w-4 h-4" />} label="Building" value={cp.Author.building} />
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
