import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Zap, Hammer, Trash2, Pencil, X, Check, Calendar, MapPin, BedDouble,
  MessageSquare, Wrench, ArrowLeft, Send, AlertCircle,
  Clock,
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { POST_PLACES } from '../../constants/models';

type Role = 'faculty' | 'warden' | 'centrehead';

interface StatusAudit {
  event: string;
  timestamp: string;
}

interface ComplaintComment {
  id: number;
  comment_text: string;
  email: string;
  role: string;
  created_at: string;
}

interface ComplaintPost {
  id: number;
  type_of_post: string;
  title: string;
  description: string;
  status: string;
  stage: string;
  assigned_je_id: number | null;
  place?: string;
  room_number?: string;
  created_at: string;
  updated_at?: string;
  comments?: ComplaintComment[] | null;
  status_audit_logs?: StatusAudit[] | null;
}

interface EditForm {
  title: string;
  description: string;
  place: string;
  room_number: string;
}

const STATUS_CONFIG: Record<string, { label: string; pill: string; dot: string }> = {
  pending_xen:  { label: 'Pending · XEN', pill: 'bg-amber-100 text-amber-800 border-amber-300',    dot: 'bg-amber-400' },
  pending_ae:   { label: 'Pending · AE',  pill: 'bg-sky-100 text-sky-800 border-sky-300',          dot: 'bg-sky-400' },
  resolved_ae:  { label: 'Resolved · AE', pill: 'bg-teal-100 text-teal-800 border-teal-300',      dot: 'bg-teal-400' },
  pending_je:   { label: 'Pending · JE',  pill: 'bg-violet-100 text-violet-800 border-violet-300', dot: 'bg-violet-400' },
  resolved_je:  { label: 'Resolved · JE', pill: 'bg-teal-100 text-teal-800 border-teal-300',      dot: 'bg-teal-400' },
  resolved_all: { label: 'Resolved · All', pill: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
};


function statusStyle(s: string) {
  const norm = s.toLowerCase();
  return STATUS_CONFIG[norm] ?? { label: s.replace(/_/g, ' '), pill: 'bg-gray-100 text-gray-600 border-gray-300', dot: 'bg-gray-400' };
}

function typeTheme(isElectrical: boolean) {
  return isElectrical
    ? { cardBg: 'bg-amber-50', accentBar: 'bg-amber-400', headerBg: 'bg-amber-100/70', iconColor: 'text-amber-600', badge: 'bg-amber-200 text-amber-900 border-amber-400', stageDone: 'bg-amber-500 border-amber-500' }
    : { cardBg: 'bg-sky-50',   accentBar: 'bg-sky-500',   headerBg: 'bg-sky-100/70',   iconColor: 'text-sky-600',   badge: 'bg-sky-200 text-sky-900 border-sky-400',       stageDone: 'bg-sky-600 border-sky-600' };
}

function isEditWindowExpired(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() >= 30 * 60 * 1000;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function roleLabel(position: string) {
  return position.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PostView() {
  const { role, post_id } = useParams<{ role: Role; post_id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<ComplaintPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    title: '', description: '', place: '', room_number: '',
  });
  const [isBusy, setIsBusy] = useState(false);

  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    try {
      const res = await fetch(`/api/post/${role}/${post_id}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error(`Failed to fetch post details (${res.status})`);
      }
      const data = await res.json();
      setPost(data.post);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [role, post_id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const timelineItems = useMemo(() => {
    if (!post) return [];
    const items: Array<
      | { type: 'comment'; data: ComplaintComment; date: Date }
      | { type: 'audit'; data: StatusAudit; date: Date }
    > = [];

    if (post.comments) {
      post.comments.forEach((c) => {
        items.push({
          type: 'comment',
          data: c,
          date: new Date(c.created_at),
        });
      });
    }

    if (post.status_audit_logs) {
      post.status_audit_logs.forEach((log) => {
        items.push({
          type: 'audit',
          data: log,
          date: new Date(log.timestamp),
        });
      });
    }

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [post]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-semibold text-sm">Loading complaint details…</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="flex-grow flex items-center justify-center py-12">
          <div className="max-w-md w-full mx-4 bg-white border border-gray-200 border-t-2 border-t-red-500 rounded-lg p-6 shadow-sm text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Complaint</h3>
            <p className="text-sm text-gray-600 mb-4">{error || 'Complaint not found.'}</p>
            <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isFaculty = role === 'faculty';
  const isWarden = role === 'warden';
  const status = statusStyle(post.status);
  const isElectrical = post.type_of_post === 'Electrical';
  const theme = typeTheme(isElectrical);
  const comments = post.comments ?? [];
  const editExpired = isEditWindowExpired(post.created_at);

  const editBase = isFaculty ? '/api/post/faculty/edit' : isWarden ? '/api/post/warden/edit' : '/api/post/centrehead/edit';
  const deleteBase = isFaculty ? '/api/post/faculty/delete' : isWarden ? '/api/post/warden/delete' : '/api/post/centrehead/delete';

  function startEdit() {
    if (!post) return;
    setIsEditing(true);
    setEditForm({
      title: post.title ?? '',
      description: post.description ?? '',
      place: post.place ?? '',
      room_number: post.room_number ?? '',
    });
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    if (!post) return;
    if (!window.confirm('Save changes to this complaint?')) return;
    setIsBusy(true);

    const body: Record<string, string> = { title: editForm.title, description: editForm.description };
    if (isFaculty) body.place = editForm.place;
    if (isWarden) body.room_number = editForm.room_number;

    try {
      const res = await fetch(`${editBase}/${post.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? `Failed to save edit (${res.status})`);
      }
      setPost((prev) => prev ? { ...prev, ...body } : null);
      setIsEditing(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    setIsBusy(true);
    try {
      const res = await fetch(`${deleteBase}/${post.id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? `Failed to delete (${res.status})`);
      }
      navigate('/profile');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  }

  async function submitComment() {
    if (!post) return;
    const content = commentText.trim();
    if (!content) return;
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const res = await fetch(`/api/post/${role}/comment/${post.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Content: content }),
      });
      if (!res.ok) {
        let msg = `Failed to post comment (${res.status})`;
        try { const b = await res.json(); if (b?.error) msg = b.error; } catch { /* ignore */ }
        throw new Error(msg);
      }
      setCommentText('');
      fetchPost();
    } catch (err) {
      setCommentError((err as Error).message);
    } finally {
      setCommentSubmitting(false);
    }
  }


  return (
    <MainLayout>
      <div className="flex-grow flex flex-col max-w-4xl w-full mx-auto px-6 py-6 space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isEditing && !editExpired && (
              <button
                onClick={startEdit}
                disabled={isBusy}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-40 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white rounded-lg transition disabled:opacity-40 cursor-pointer"
                >
                  {isBusy ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-40 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </>
            )}
            {!editExpired && (
              <button
                onClick={handleDelete}
                disabled={isBusy}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-rose-200 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition disabled:opacity-40 cursor-pointer"
              >
                {isBusy && !isEditing
                  ? <div className="w-3 h-3 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Post Main Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Accent strip */}
          <div className={`h-1.5 w-full ${theme.accentBar}`} />
          
          <div className="p-6 space-y-6">
            
            {/* Title / Badges */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-gray-400">
                  <span>Complaint #{post.id}</span>
                </div>
                {isEditing ? (
                  <div className="mt-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full text-base text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:border-gray-600"
                    />
                  </div>
                ) : (
                  <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${theme.badge}`}>
                  {isElectrical ? <Zap className="w-3 h-3" /> : <Hammer className="w-3 h-3" />}
                  {post.type_of_post}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Description</h4>
              {isEditing ? (
                <textarea
                  rows={5}
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:border-gray-600 resize-none"
                />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.description}</p>
              )}
            </div>


            {/* Meta Info */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className={`w-4.5 h-4.5 shrink-0 ${theme.iconColor}`} />
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Filed on</p>
                  <p className="font-medium text-xs">{formatDate(post.created_at)}</p>
                </div>
              </div>

              {isFaculty && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className={`w-4.5 h-4.5 shrink-0 ${theme.iconColor}`} />
                  <div className="flex-grow">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Location</p>
                    {isEditing ? (
                      <select
                        value={editForm.place}
                        onChange={(e) => setEditForm(prev => ({ ...prev, place: e.target.value }))}
                        className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded px-2 py-0.5 mt-1 focus:outline-none"
                      >
                        <option value="" disabled>Select Area</option>
                        {POST_PLACES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    ) : (
                      <p className="font-medium text-xs">{post.place}</p>
                    )}
                  </div>
                </div>
              )}

              {isWarden && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BedDouble className={`w-4.5 h-4.5 shrink-0 ${theme.iconColor}`} />
                  <div className="flex-grow">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Room Number</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.room_number}
                        onChange={(e) => setEditForm(prev => ({ ...prev, room_number: e.target.value }))}
                        className="w-full text-xs text-gray-800 bg-white border border-gray-300 rounded px-2 py-0.5 mt-1 focus:outline-none"
                      />
                    ) : (
                      <p className="font-medium text-xs">{post.room_number}</p>
                    )}
                  </div>
                </div>
              )}

              {post.assigned_je_id != null && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wrench className={`w-4.5 h-4.5 shrink-0 ${theme.iconColor}`} />
                  <div>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Assigned JE</p>
                    <p className="font-medium text-xs">JE #{post.assigned_je_id}</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Comments Section */}
        {!isEditing && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <MessageSquare className={`w-4 h-4 ${theme.iconColor}`} />
              <h3 className="text-sm font-bold text-gray-800">Official Responses</h3>
              {comments.length > 0 && (
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{comments.length}</span>
              )}
            </div>

            {/* Combined Timeline */}
            {timelineItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquare className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400 font-medium">No activity or responses yet</p>
              </div>
            ) : (
              <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-6 mb-8">
                {timelineItems.map((item, idx) => {
                  if (item.type === 'audit') {
                    const audit = item.data;
                    const normEvent = audit.event.toLowerCase();
                    const dotColor = STATUS_CONFIG[normEvent]?.dot ?? 'bg-gray-400';
                    const eventText = (() => {
                      if (normEvent === 'pending_xen') return 'Sent to XEN for review.';
                      if (normEvent === 'pending_ae') return 'Sent to AE for review.';
                      if (normEvent === 'resolved_ae') return 'Post marked as resolved by AE.';
                      if (normEvent === 'pending_je') return 'Sent to JE for review.';
                      if (normEvent === 'resolved_je') return 'Post marked as resolved by JE.';
                      if (normEvent === 'resolved_all') return 'Post Resolved and closed by XEN.';
                      return `Status updated to ${audit.event.replace(/_/g, ' ')}`;
                    })();

                    return (
                      <div key={`audit-${idx}`} className="relative">
                        <span className="absolute -left-[30px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-white ring-4 ring-white">
                          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-gray-400">
                            {formatDateTime(audit.timestamp)}
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {eventText}
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    const c = item.data;
                    const author = c.role ? roleLabel(c.role) : 'Staff';
                    const borderCls = theme.accentBar.replace('bg-', 'border-');

                    return (
                      <div key={`comment-${c.id}`} className="relative">
                        <span className="absolute -left-[34px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-4 ring-white">
                          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                        </span>
                        <div className={`border-l-2 ${borderCls}/50 bg-gray-50 rounded-r-lg px-4 py-3 relative`}>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="min-w-0 flex items-baseline gap-1.5">
                              <span className="text-xs font-bold text-gray-800">{author}</span>
                              {c.email && <span className="text-[10px] text-gray-400 truncate">{c.email}</span>}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(c.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{c.comment_text}</p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            )}

            {/* Composer */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-end gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitComment(); }}
                  disabled={commentSubmitting}
                  rows={2}
                  placeholder="Add a reply/update…"
                  className="flex-1 text-xs text-gray-800 placeholder-gray-400 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition disabled:opacity-50"
                />
                <button
                  onClick={submitComment}
                  disabled={commentSubmitting || !commentText.trim()}
                  title="Post reply (Ctrl/⌘ + Enter)"
                  className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gray-900 hover:bg-gray-700 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {commentSubmitting
                    ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Send className="w-3.5 h-3.5" />}
                  Send
                </button>
              </div>
              {commentError && (
                <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {commentError}
                </p>
              )}
            </div>

          </div>
        )}

      </div>
    </MainLayout>
  );
}
