import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap, Hammer, Trash2, Pencil, X, Check, Calendar, MapPin, BedDouble,
  MessageSquare, Wrench, GitBranch, ChevronRight, UserCircle, Clock,
} from 'lucide-react';
import { POST_PLACES } from '../constants/models';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Role = 'faculty' | 'warden' | 'centrehead';

export interface CommentAuthor {
  id: number;
  email: string;
  position: string;
}

export interface ComplaintComment {
  id: number;
  comment_text: string;
  author_id: number;
  Author?: CommentAuthor;
  created_at: string;
}

export interface ComplaintPost {
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
}

export interface EditForm {
  title: string;
  description: string;
  place: string;
  room_number: string;
}

interface ComplaintCardProps {
  post: ComplaintPost;
  role: Role;
  isEditing: boolean;
  isBusy: boolean;
  editForm: EditForm;
  onEditFormChange: (patch: Partial<EditForm>) => void;
  onStartEdit: (post: ComplaintPost) => void;
  onCancelEdit: () => void;
  onSaveEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
}

// ── Status config ──────────────────────────────────────────────────────────────

interface StatusStyle { label: string; pill: string; dot: string }

const STATUS_CONFIG: Record<string, StatusStyle> = {
  Pending_XEN: { label: 'Pending · XEN', pill: 'bg-amber-100 text-amber-800 border-amber-300',    dot: 'bg-amber-400' },
  Pending_AE:  { label: 'Pending · AE',  pill: 'bg-sky-100 text-sky-800 border-sky-300',          dot: 'bg-sky-400' },
  Pending_JE:  { label: 'Pending · JE',  pill: 'bg-violet-100 text-violet-800 border-violet-300', dot: 'bg-violet-400' },
  Resolved_JE: { label: 'Resolved by JE', pill: 'bg-teal-100 text-teal-800 border-teal-300',      dot: 'bg-teal-400' },
  Resolved:    { label: 'Resolved',       pill: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  Closed:      { label: 'Closed',         pill: 'bg-rose-100 text-rose-800 border-rose-300',      dot: 'bg-rose-400' },
};

const FALLBACK: StatusStyle = { label: 'Unknown', pill: 'bg-gray-100 text-gray-600 border-gray-300', dot: 'bg-gray-400' };

function statusStyle(s: string): StatusStyle {
  return STATUS_CONFIG[s] ?? { ...FALLBACK, label: s.replace(/_/g, ' ') };
}

const STAGES = ['XEN', 'AE', 'JE'];

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

// ── Type theme ─────────────────────────────────────────────────────────────────

function typeTheme(isElectrical: boolean) {
  return isElectrical
    ? { cardBg: 'bg-amber-50',  accentBar: 'bg-amber-400',  headerBg: 'bg-amber-100/70', iconColor: 'text-amber-600', badge: 'bg-amber-200 text-amber-900 border-amber-400', stageDone: 'bg-amber-500 border-amber-500' }
    : { cardBg: 'bg-sky-50',    accentBar: 'bg-sky-500',    headerBg: 'bg-sky-100/70',   iconColor: 'text-sky-600',   badge: 'bg-sky-200 text-sky-900 border-sky-400',       stageDone: 'bg-sky-600 border-sky-600' };
}

// ── Stage tracker ──────────────────────────────────────────────────────────────

function StageTracker({ stage, theme }: { stage: string; theme: ReturnType<typeof typeTheme> }) {
  const current = STAGES.indexOf(stage);
  return (
    <div className="flex items-center gap-2">
      <GitBranch className={`w-3.5 h-3.5 shrink-0 ${theme.iconColor}`} />
      <div className="flex items-center gap-0">
        {STAGES.map((s, idx) => {
          const done = current >= 0 && idx <= current;
          const isLast = idx === STAGES.length - 1;
          return (
            <div key={s} className="flex items-center">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 border transition-colors ${
                idx === 0 ? 'rounded-l-full' : ''
              } ${isLast ? 'rounded-r-full' : ''} ${
                done ? `${theme.stageDone} text-white` : 'bg-white/60 text-gray-400 border-gray-300'
              }`}>
                {s}
              </span>
              {!isLast && (
                <div className={`w-px h-4 ${done && current > idx ? theme.stageDone.replace('bg-', 'bg-') : 'bg-gray-300'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Edit form ──────────────────────────────────────────────────────────────────

function EditFormFields({
  editForm, isFaculty, isWarden, onEditFormChange,
}: {
  editForm: EditForm;
  isFaculty: boolean;
  isWarden: boolean;
  onEditFormChange: (patch: Partial<EditForm>) => void;
}) {
  const inputCls = 'w-full text-sm text-gray-800 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/40 focus:border-gray-600';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1';
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className={labelCls}>Title</label>
        <input value={editForm.title} onChange={(e) => onEditFormChange({ title: e.target.value })} className={inputCls} />
      </div>
      {isFaculty && (
        <div>
          <label className={labelCls}>Area / Place</label>
          <select value={editForm.place} onChange={(e) => onEditFormChange({ place: e.target.value })} className={inputCls}>
            <option value="" disabled>Select Area</option>
            {POST_PLACES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      )}
      {isWarden && (
        <div>
          <label className={labelCls}>Room Number</label>
          <input value={editForm.room_number} onChange={(e) => onEditFormChange({ room_number: e.target.value })} className={inputCls} />
        </div>
      )}
      <div>
        <label className={labelCls}>Description</label>
        <textarea rows={5} value={editForm.description} onChange={(e) => onEditFormChange({ description: e.target.value })}
          className={`${inputCls} resize-none`} />
      </div>
    </div>
  );
}

// ── Comments list ──────────────────────────────────────────────────────────────

function CommentsList({ comments }: { comments: ComplaintComment[] }) {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <MessageSquare className="w-8 h-8 text-gray-200 mb-2" />
        <p className="text-sm text-gray-400 font-medium">No official responses yet</p>
        <p className="text-xs text-gray-400 mt-0.5">Comments from staff will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((c, idx) => {
        const author = c.Author?.position ? roleLabel(c.Author.position) : `Admin #${c.author_id}`;
        const initials = author.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
        return (
          <div key={c.id} className="flex gap-3">
            {/* Avatar */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-[11px] font-bold text-white">
              {initials || <UserCircle className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-200 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-gray-800">{author}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(c.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.comment_text}</p>
              </div>
              {idx < comments.length - 1 && <div className="ml-4 w-px h-2 bg-gray-200" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps extends ComplaintCardProps {
  onClose: () => void;
}

function PostModal({
  post, role, isEditing, isBusy, editForm,
  onEditFormChange, onStartEdit, onCancelEdit, onSaveEdit, onDelete, onClose,
}: ModalProps) {
  const isFaculty    = role === 'faculty';
  const isWarden     = role === 'warden';
  const status       = statusStyle(post.status);
  const isElectrical = post.type_of_post === 'Electrical';
  const theme        = typeTheme(isElectrical);
  const comments     = post.comments ?? [];
  const currentStageIdx = STAGES.indexOf(post.stage);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Modal header */}
        <div className={`${theme.headerBg} border-b border-gray-200 px-6 py-4 flex items-start justify-between gap-4 shrink-0`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-gray-400">#{post.id}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
              {isElectrical ? <Zap className="w-3 h-3" /> : <Hammer className="w-3 h-3" />}
              {post.type_of_post}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${status.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isEditing && (
              <button
                onClick={() => onStartEdit(post)}
                disabled={isBusy}
                title="Edit"
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/70 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            {isEditing && (
              <>
                <button onClick={() => onSaveEdit(post.id)} disabled={isBusy} title="Save"
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-40 cursor-pointer">
                  {isBusy ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4 text-white" />}
                </button>
                <button onClick={onCancelEdit} disabled={isBusy} title="Cancel"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/70 transition-colors disabled:opacity-40 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => onDelete(post.id)} disabled={isBusy} title="Delete"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer">
              {isBusy && !isEditing
                ? <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                : <Trash2 className="w-4 h-4" />}
            </button>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            <button onClick={onClose} title="Close"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/70 transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">

          {/* Post details */}
          <div className="px-6 py-5 border-b border-gray-100">
            {isEditing ? (
              <EditFormFields
                editForm={editForm}
                isFaculty={isFaculty}
                isWarden={isWarden}
                onEditFormChange={onEditFormChange}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{post.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{post.description}</p>

                <StageTracker stage={post.stage} theme={theme} />

                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className={`w-4 h-4 shrink-0 ${theme.iconColor}`} />
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Filed on</p>
                      <p className="font-medium text-xs">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  {isFaculty && post.place && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className={`w-4 h-4 shrink-0 ${theme.iconColor}`} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Location</p>
                        <p className="font-medium text-xs">{post.place}</p>
                      </div>
                    </div>
                  )}
                  {isWarden && post.room_number && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BedDouble className={`w-4 h-4 shrink-0 ${theme.iconColor}`} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Room</p>
                        <p className="font-medium text-xs">{post.room_number}</p>
                      </div>
                    </div>
                  )}
                  {post.assigned_je_id != null && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Wrench className={`w-4 h-4 shrink-0 ${theme.iconColor}`} />
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Assigned JE</p>
                        <p className="font-medium text-xs">JE #{post.assigned_je_id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          {!isEditing && (
            <div className="px-6 py-5 bg-gray-50/60">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className={`w-4 h-4 ${theme.iconColor}`} />
                <h3 className="text-sm font-bold text-gray-800">Official Responses</h3>
                {comments.length > 0 && (
                  <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{comments.length}</span>
                )}
              </div>
              <CommentsList comments={comments} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Card (compact preview) ─────────────────────────────────────────────────────

export function ComplaintCard({
  post, role, isEditing, isBusy, editForm,
  onEditFormChange, onStartEdit, onCancelEdit, onSaveEdit, onDelete,
}: ComplaintCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const status       = statusStyle(post.status);
  const isElectrical = post.type_of_post === 'Electrical';
  const theme        = typeTheme(isElectrical);
  const comments     = post.comments ?? [];
  const isFaculty    = role === 'faculty';
  const isWarden     = role === 'warden';

  return (
    <>
      {/* ── Compact card ── */}
      <div
        onClick={() => setModalOpen(true)}
        className={`${theme.cardBg} border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group`}
      >
        {/* Top accent */}
        <div className={`h-1 w-full ${theme.accentBar}`} />

        <div className="px-4 py-4">
          {/* Row 1: badges + actions */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-mono font-bold text-gray-400">#{post.id}</span>

            <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${theme.badge}`}>
              {isElectrical ? <Zap className="w-3 h-3" /> : <Hammer className="w-3 h-3" />}
              {post.type_of_post}
            </span>

            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${status.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>

            <div className="ml-auto flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onStartEdit(post)} disabled={isBusy} title="Edit"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/80 transition-colors disabled:opacity-40 cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(post.id)} disabled={isBusy} title="Delete"
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-40 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title + description */}
          <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1.5">{post.title}</h4>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{post.description}</p>

          {/* Footer row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" /> {formatDate(post.created_at)}
              </span>
              {isFaculty && post.place && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" /> {post.place}
                </span>
              )}
              {isWarden && post.room_number && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <BedDouble className="w-3 h-3" /> {post.room_number}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {comments.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <MessageSquare className="w-3 h-3" /> {comments.length}
                </span>
              )}
              <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all ${theme.iconColor} opacity-0 group-hover:opacity-100`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <PostModal
          post={post}
          role={role}
          isEditing={isEditing}
          isBusy={isBusy}
          editForm={editForm}
          onEditFormChange={onEditFormChange}
          onStartEdit={(p) => { onStartEdit(p); }}
          onCancelEdit={() => { onCancelEdit(); }}
          onSaveEdit={(id) => { onSaveEdit(id); }}
          onDelete={(id) => { onDelete(id); setModalOpen(false); }}
          onClose={() => { setModalOpen(false); if (isEditing) onCancelEdit(); }}
        />
      )}
    </>
  );
}
