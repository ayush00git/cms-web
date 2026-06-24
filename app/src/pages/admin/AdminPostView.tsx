import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  ServerCrash,
  ArrowLeft,
  BedDouble,
  Building2,
  Zap,
  Hammer,
  MessageSquare,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCcw,
  Pencil,
  Trash2,
  Info,
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

interface Comment {
  id: number;
  comment_text: string;
  email: string;
  role: string;
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
  centrehead_id: number;
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
  position: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending_xen:  'bg-amber-50 text-amber-700 border-amber-200',
  pending_ae:   'bg-blue-50 text-blue-700 border-blue-200',
  resolved_ae:  'bg-teal-50 text-teal-700 border-teal-200',
  pending_je:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  resolved_je:  'bg-teal-50 text-teal-700 border-teal-200',
  resolved_all: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

// Solid dot colour per status — mirrors the badge palette for the status pill
const STATUS_DOT: Record<string, string> = {
  pending_xen:  'bg-amber-500',
  pending_ae:   'bg-blue-500',
  resolved_ae:  'bg-teal-500',
  pending_je:   'bg-indigo-500',
  resolved_je:  'bg-teal-500',
  resolved_all: 'bg-emerald-500',
};

// Maps URL role param → API segment for the status endpoint
const ROLE_TO_STATUS_API: Record<string, string> = {
  faculty:    'faculty_posts',
  warden:     'warden_posts',
  centrehead: 'centrehead_posts',
};

// Maps URL role param → API segment for the comment endpoint
const ROLE_TO_COMMENT_API: Record<string, string> = {
  faculty:    'faculty_posts',
  warden:     'warden_posts',
  centrehead: 'centrehead_posts',
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
  const norm = status.toLowerCase();
  if (adminType === 'xen') {
    if (norm === 'pending_xen') return [
      { label: 'Send to AE', review: 'pending_ae', icon: <ChevronRight className="w-3.5 h-3.5" /> },
      { label: 'Resolved',  review: 'resolved_all',  icon: <XCircle      className="w-3.5 h-3.5" /> },
    ];
    if (norm === 'resolved_ae') return [
      { label: 'Resolved', review: 'resolved_all', icon: <XCircle className="w-3.5 h-3.5" /> },
      { label: 'Send back to AE', review: 'pending_ae', icon: <RefreshCcw className="w-3.5 h-3.5" /> },
    ];
    if (norm === 'resolved_all') return [
      { label: 'Reopen Post', review: 'pending_xen', icon: <RefreshCcw className="w-3.5 h-3.5" /> },
    ];
  }
  if (adminType === 'ae') {
    if (norm === 'pending_ae') return [
      { label: 'Assign to JE',    review: 'pending_je',          icon: <ChevronRight className="w-3.5 h-3.5" /> },
      { label: 'Escalate to XEN', review: 'pending_xen',  icon: <RefreshCcw   className="w-3.5 h-3.5" /> },
    ];
    if (norm === 'resolved_je') return [
      { label: 'Send to XEN', review: 'resolved_ae', icon: <ChevronRight className="w-3.5 h-3.5" /> },
    ];
  }
  if (adminType === 'je') {
    if (norm === 'pending_je') return [
      { label: 'Mark Resolved',  review: 'resolved_je',        icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
      { label: 'Escalate to AE', review: 'pending_ae',  icon: <RefreshCcw   className="w-3.5 h-3.5" /> },
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

function isEditWindowExpired(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() >= 30 * 60 * 1000;
}


// A single label/value pair in the "About this post" section
function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-gray-800">{value || '—'}</dd>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function AdminPostView() {
  const { role, post_id } = useParams<{ role: string; post_id: string }>();
  const navigate = useNavigate();

  const [post, setPost]     = useState<Post | null>(null);
  // Admin position comes from the server (AdminGetPost response) rather than
  // per-tab sessionStorage, so action gating survives new tabs / direct nav.
  const [adminPosition, setAdminPosition] = useState('');
  const adminType = adminPosition.startsWith('XEN') ? 'xen' : adminPosition.startsWith('AE') ? 'ae' : adminPosition.startsWith('JE') ? 'je' : '';
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<{ message: string; status?: number } | null>(null);

  // Combined comment + status action state
  const [commentText, setCommentText] = useState('');
  const [acting, setActing]           = useState(false);
  const [actError, setActError]       = useState<string | null>(null);
  const [actSuccess, setActSuccess]   = useState<string | null>(null);
  const actTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // JEs list for assignment dropdown
  const [jes, setJes] = useState<{ id: number; email: string; position: string }[]>([]);
  const [jeDropdownOpen, setJeDropdownOpen] = useState(false);

  // Admin's own comments states
  const [adminComments, setAdminComments] = useState<Comment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [commentActionLoadingId, setCommentActionLoadingId] = useState<number | null>(null);

  const fetchAdminComments = useCallback(() => {
    fetch('/api/admin/comments', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch admin comments');
        return res.json();
      })
      .then((json) => {
        if (json.comments) {
          setAdminComments(json.comments);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchJEs = useCallback(() => {
    fetch('/api/admin/return-je', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch JEs');
        return res.json();
      })
      .then((json) => {
        if (json.JEs) {
          setJes(json.JEs);
        }
      })
      .catch((err) => console.error(err));
  }, []);

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
        setAdminPosition(json.position ?? '');
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

  useEffect(() => {
    fetchPost();
    fetchAdminComments();
  }, [fetchPost, fetchAdminComments]);

  useEffect(() => () => { if (actTimer.current) clearTimeout(actTimer.current); }, []);

  useEffect(() => {
    if (post && post.assigned_je_id != null) {
      fetchJEs();
    }
  }, [post, fetchJEs]);

  // ── Edit comment handler ──
  async function handleEditComment(commentId: number) {
    const trimmed = editingText.trim();
    if (!trimmed) return;

    const commentApi = ROLE_TO_COMMENT_API[role ?? ''];
    if (!commentApi) {
      setActError('Unknown post type.');
      return;
    }

    setCommentActionLoadingId(commentId);
    try {
      const res = await fetch(`/api/admin/comment/${commentApi}/${post_id}/${commentId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Content: trimmed }),
      });

      if (!res.ok) {
        let msg = `Failed to edit comment (${res.status})`;
        try { const b = await res.json(); if (b?.error) msg = b.error; } catch {}
        throw new Error(msg);
      }

      setEditingCommentId(null);
      setEditingText('');
      fetchPost(true);
      fetchAdminComments();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCommentActionLoadingId(null);
    }
  }

  // ── Delete comment handler ──
  async function handleDeleteComment(commentId: number) {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    const commentApi = ROLE_TO_COMMENT_API[role ?? ''];
    if (!commentApi) {
      setActError('Unknown post type.');
      return;
    }

    setCommentActionLoadingId(commentId);
    try {
      const res = await fetch(`/api/admin/comment/${commentApi}/${post_id}/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        let msg = `Failed to delete comment (${res.status})`;
        try { const b = await res.json(); if (b?.error) msg = b.error; } catch {}
        throw new Error(msg);
      }

      fetchPost(true);
      fetchAdminComments();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setCommentActionLoadingId(null);
    }
  }

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
      fetchAdminComments();
    } catch (err) {
      setActError((err as Error).message);
    } finally {
      setActing(false);
    }
  }

  async function handleAssignToJE(jeEmail: string) {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const commentApi = ROLE_TO_COMMENT_API[role ?? ''];
    const statusApi  = ROLE_TO_STATUS_API[role ?? ''];
    if (!commentApi || !statusApi) {
      setActError('Unknown post type.');
      return;
    }

    setActing(true);
    setActError(null);
    setActSuccess(null);
    setJeDropdownOpen(false);

    try {
      // 1. Post the comment with the user's commentText and the JE email appended
      const contentWithJE = `${trimmed} (Assigned to: ${jeEmail})`;
      const commentRes = await fetch(`/api/admin/comment/${commentApi}/${post_id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Content: contentWithJE }),
      });
      if (!commentRes.ok) {
        let msg = `Failed to post comment (${commentRes.status})`;
        try { const b = await commentRes.json(); if (b?.error) msg = b.error; } catch {}
        throw new Error(msg);
      }

      // 2. Update status to pending_je
      const statusRes = await fetch(`/api/admin/${statusApi}/status/${post_id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Review: 'pending_je', JeToAssign: jeEmail }),
      });
      if (!statusRes.ok) {
        let msg = `Comment posted but status update failed (${statusRes.status})`;
        try { const b = await statusRes.json(); if (b?.error) msg = b.error; } catch {}
        throw new Error(msg);
      }

      setCommentText('');
      setActSuccess('Assigned to JE successfully!');
      if (actTimer.current) clearTimeout(actTimer.current);
      actTimer.current = setTimeout(() => setActSuccess(null), 3000);
      fetchPost(true);
      fetchAdminComments();
    } catch (err) {
      setActError((err as Error).message);
    } finally {
      setActing(false);
    }
  }

  // ── Comment only handler ──
  async function handlePostCommentOnly() {
    const trimmed = commentText.trim();
    if (!trimmed) return;

    const commentApi = ROLE_TO_COMMENT_API[role ?? ''];
    if (!commentApi) {
      setActError('Unknown post type.');
      return;
    }

    setActing(true);
    setActError(null);
    setActSuccess(null);

    try {
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

      setCommentText('');
      setActSuccess('Comment posted successfully!');
      if (actTimer.current) clearTimeout(actTimer.current);
      actTimer.current = setTimeout(() => setActSuccess(null), 3000);
      fetchPost(true);
      fetchAdminComments();
    } catch (err) {
      setActError((err as Error).message);
    } finally {
      setActing(false);
    }
  }

  const assignedJEEmail = useMemo(() => {
    if (!post || post.assigned_je_id == null) return null;
    return jes.find((j) => j.id === post.assigned_je_id)?.email || null;
  }, [post, jes]);

  // ── Loading ──
  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center bg-white py-20">
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
        <div className="flex-grow flex items-center justify-center bg-white py-20">
          <div className="max-w-md w-full mx-4 text-center">
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
  const statusCls  = STATUS_STYLES[post.status.toLowerCase()] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  const statusDot  = STATUS_DOT[post.status.toLowerCase()] ?? 'bg-gray-400';
  const statusText = (() => {
    const norm = post.status.toLowerCase();
    if (norm === 'pending_xen') return 'Pending XEN';
    if (norm === 'pending_ae') return 'Pending AE';
    if (norm === 'resolved_ae') return 'Resolved AE';
    if (norm === 'pending_je') return 'Pending JE';
    if (norm === 'resolved_je') return 'Resolved JE';
    if (norm === 'resolved_all') return 'Resolved All';
    return post.status.replace(/_/g, ' ');
  })();
  const backPath   = ADMIN_BACK[adminType ?? ''] ?? '/';
  const actionBtns = getActionButtons(adminType ?? '', post.status);
  const canAct     = actionBtns.length > 0;
  const disabled   = acting || !commentText.trim();

  // Who filed it — faculty have a name, the rest go by email
  const filedBy = fp?.Author?.name || fp?.Author?.email || wp?.Author?.email || cp?.Author?.email || 'Unknown';
  const email   = fp?.Author?.email || wp?.Author?.email || cp?.Author?.email;
  const phone   = fp?.Author?.phone_number || wp?.Author?.phone_number || cp?.Author?.phone_number;



  return (
    <MainLayout>
      <div className="flex-grow bg-white py-10">
        <div className="max-w-3xl mx-auto px-6">

          {/* Back + breadcrumb */}
          <div className="mb-8 flex items-center gap-3">
            <Link
              to={backPath}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs text-gray-400 font-mono">#{post.id} · {roleLabel}</span>
          </div>

          {/* ── Post ── */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
              <RoleIcon className="w-3.5 h-3.5" /> {roleLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
              {post.type_of_post === 'Electrical'
                ? <Zap className="w-3.5 h-3.5" />
                : <Hammer className="w-3.5 h-3.5" />
              }
              {post.type_of_post}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusCls}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              {statusText}
            </span>
          </div>

          {/* Title and Assigned JE */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {post.title}
            </h1>
            {assignedJEEmail && (
              <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full md:self-start">
                Assigned JE - {assignedJEEmail}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line mb-10">
            {post.description}
          </p>

          {/* About this post */}
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            About this post
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5 bg-gray-50 border border-gray-100 rounded-xl p-5">
            <Detail label="Filed by" value={filedBy} />
            {fp && <Detail label="Department" value={fp.Author?.department} />}
            {fp && <Detail label="Area" value={fp.place} />}
            {fp && fp.Author && (
              <Detail label="Residence" value={`House ${fp.Author.house_number}, Block ${fp.Author.block} (Type ${fp.Author.type})`} />
            )}
            {wp && <Detail label="Hostel" value={wp.Author?.hostel} />}
            {wp && <Detail label="Room" value={wp.room_number} />}
            {cp && <Detail label="Building" value={cp.Author?.building} />}
            <Detail label="Email" value={email} />
            <Detail label="Phone" value={phone} />
            <Detail label="Stage" value={post.stage} />
            {post.assigned_je_id != null && <Detail label="Assigned JE" value={`#${post.assigned_je_id}`} />}
            <Detail label="Filed on" value={formatDate(post.created_at)} />
            <Detail label="Last updated" value={formatDate(post.updated_at)} />
          </dl>

          {/* ── Comments ── */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-5">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              Comments
              <span className="text-gray-400 font-semibold">({comments.length})</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-normal ml-2 bg-gray-100 px-2 py-0.5 rounded-full">
                <Info className="w-3 h-3 text-gray-400" />
                Comments can be updated only within 30 minutes
              </span>
            </h2>

            {/* Comment list */}
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 italic mb-8">No comments yet.</p>
            ) : (
              <ul className="space-y-3 mb-8">
                {comments.map((c) => {
                  const who = c.role ? c.role.replace(/_/g, ' ') : 'Staff';
                  const isMyComment = adminComments.some((ac) => ac.id === c.id);
                  const isEditing = editingCommentId === c.id;
                  const isBusy = commentActionLoadingId === c.id;
                  const editExpired = isEditWindowExpired(c.created_at);

                  const isJEComment = jes.some((je) => c.comment_text.includes(je.email));
                  if (isJEComment && post?.status !== 'pending_je') {
                    return null;
                  }

                  return (
                    <li key={c.id} className="border-l-2 border-[#ff9900]/50 bg-gray-50 rounded-r-lg px-4 py-3 group/comment relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-800">{who}</span>
                        {c.email && <span className="text-[11px] text-gray-400 truncate max-w-[150px] sm:max-w-none">{c.email}</span>}
                        <span className="ml-auto text-[11px] text-gray-400 flex items-center gap-2">
                          {formatDateTime(c.created_at)}
                          
                          {/* Edit/Delete actions (only shown for owner comments on hover and when not editing/expired) */}
                          {isMyComment && !isEditing && !editExpired && (
                            <span className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingCommentId(c.id);
                                  setEditingText(c.comment_text);
                                }}
                                disabled={isBusy}
                                className="p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition cursor-pointer"
                                title="Edit comment"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteComment(c.id)}
                                disabled={isBusy}
                                className="p-0.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                title="Delete comment"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            disabled={isBusy}
                            rows={2}
                            className="w-full text-sm text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff9900]/40 focus:border-[#ff9900] transition resize-none"
                          />
                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              disabled={isBusy}
                              className="border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold text-[11px] px-2.5 py-1.5 rounded transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditComment(c.id)}
                              disabled={isBusy || !editingText.trim()}
                              className="bg-[#2d2d2d] text-white hover:bg-[#ff9900] font-bold text-[11px] px-3 py-1.5 rounded transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                            >
                              {isBusy && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 leading-relaxed break-words">{c.comment_text}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ── Comment + action area — always shown; unlocked for any logged-in admin ── */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Comment &amp; Update Status
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={acting || !adminType}
                placeholder={adminType
                  ? 'Add a comment…'
                  : 'No actions available.'}
                rows={3}
                className="w-full text-sm text-gray-800 placeholder-gray-300 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff9900]/40 focus:border-[#ff9900] transition disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Action buttons */}
              {adminType && (
                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <span
                    className={!commentText.trim() ? 'inline-block cursor-not-allowed' : 'inline-block'}
                    title={!commentText.trim() ? 'comment content required' : undefined}
                  >
                    <button
                      onClick={handlePostCommentOnly}
                      disabled={acting || !commentText.trim()}
                      className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#2d2d2d] hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
                    >
                      {acting ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : <MessageSquare className="w-3.5 h-3.5" />}
                      Post Comment
                    </button>
                  </span>

                  {canAct && actionBtns.map((btn) => {
                    const isAssignBtn = btn.label === 'Assign to JE';
                    if (isAssignBtn) {
                      const showBlockedTooltip = !commentText.trim();
                      return (
                        <span
                          key={btn.review}
                          className={showBlockedTooltip ? 'inline-block cursor-not-allowed' : 'inline-block'}
                          title={showBlockedTooltip ? 'comment content required' : undefined}
                        >
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => {
                                if (!jeDropdownOpen) {
                                  fetchJEs();
                                }
                                setJeDropdownOpen(!jeDropdownOpen);
                              }}
                              disabled={acting || !commentText.trim()}
                              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#ff9900] hover:bg-[#e68a00] px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
                            >
                              {acting ? (
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : btn.icon}
                              {btn.label}
                            </button>
                            {jeDropdownOpen && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setJeDropdownOpen(false)} />
                                <div className="absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                  <div className="py-1">
                                    {jes.length === 0 ? (
                                      <span className="block px-4 py-2 text-xs text-gray-500">No JEs available</span>
                                    ) : (
                                      jes.map((je) => (
                                        <button
                                          key={je.id}
                                          type="button"
                                          onClick={() => handleAssignToJE(je.email)}
                                          className="w-full text-left block px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer relative z-50"
                                        >
                                          {je.email}
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </span>
                      );
                    }

                    const isResolvedBtn = btn.label === 'Resolved';
                    const buttonColorClass = isResolvedBtn
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[#ff9900] hover:bg-[#e68a00]';
                    const showBlockedTooltip = !commentText.trim();

                    return (
                      <span
                        key={btn.review}
                        className={showBlockedTooltip ? 'inline-block cursor-not-allowed' : 'inline-block'}
                        title={showBlockedTooltip ? 'comment content required' : undefined}
                      >
                        <button
                          onClick={() => handleAction(btn.review)}
                          disabled={disabled}
                          className={`inline-flex items-center gap-2 text-xs font-bold text-white ${buttonColorClass} px-4 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer`}
                        >
                          {acting ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : btn.icon}
                          {btn.label}
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
