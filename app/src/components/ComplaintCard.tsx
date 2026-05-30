import { useState } from 'react';
import {
  Zap, Hammer, Trash2, Pencil, X, Check, Calendar, MapPin, BedDouble,
  MessageSquare, ChevronDown, Wrench, GitBranch,
} from 'lucide-react';
import { POST_PLACES } from '../constants/models';

// ── Types ────────────────────────────────────────────────────────────────────────

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

// ── Status / stage styling ─────────────────────────────────────────────────────────

interface StatusStyle {
  label: string;
  badge: string;   // pill background/text/border
  dot: string;     // status dot
}

const STATUS_CONFIG: Record<string, StatusStyle> = {
  Pending_XEN: { label: 'Pending · XEN',  badge: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-400' },
  Pending_AE:  { label: 'Pending · AE',   badge: 'bg-blue-50 text-blue-700 border-blue-200',        dot: 'bg-blue-400' },
  Pending_JE:  { label: 'Pending · JE',   badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',  dot: 'bg-indigo-400' },
  Resolved_JE: { label: 'Resolved by JE', badge: 'bg-teal-50 text-teal-700 border-teal-200',        dot: 'bg-teal-400' },
  Resolved:    { label: 'Resolved',       badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  Closed:      { label: 'Closed',         badge: 'bg-red-50 text-red-600 border-red-200',           dot: 'bg-red-400' },
};

const FALLBACK_STATUS: StatusStyle = {
  label: 'Unknown', badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400',
};

function statusStyle(status: string): StatusStyle {
  return STATUS_CONFIG[status] ?? { ...FALLBACK_STATUS, label: status.replace(/_/g, ' ') };
}

const STAGES = ['XEN', 'AE', 'JE'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// ── Component ──────────────────────────────────────────────────────────────────────

export function ComplaintCard({
  post, role, isEditing, isBusy, editForm,
  onEditFormChange, onStartEdit, onCancelEdit, onSaveEdit, onDelete,
}: ComplaintCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  const isFaculty = role === 'faculty';
  const isWarden  = role === 'warden';
  const status    = statusStyle(post.status);
  const isElectrical = post.type_of_post === 'Electrical';
  const comments  = post.comments ?? [];
  const currentStageIdx = STAGES.indexOf(post.stage);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

      {/* ── Top bar ── */}
      <div className="bg-[#2d2d2d] px-4 py-3 flex items-center gap-2">
        <span className="text-[11px] font-mono font-bold text-zinc-400">#{post.id}</span>

        {/* type badge */}
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
          isElectrical ? 'text-amber-300 bg-amber-400/10' : 'text-sky-300 bg-sky-400/10'
        }`}>
          {isElectrical ? <Zap className="w-3 h-3" /> : <Hammer className="w-3 h-3" />}
          {post.type_of_post}
        </span>

        {/* action buttons */}
        <div className="ml-auto flex items-center gap-1.5">
          {!isEditing && (
            <button
              onClick={() => onStartEdit(post)}
              disabled={isBusy}
              title="Edit"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={() => onSaveEdit(post.id)}
                disabled={isBusy}
                title="Save"
                className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {isBusy ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onCancelEdit}
                disabled={isBusy}
                title="Cancel"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={() => onDelete(post.id)}
            disabled={isBusy}
            title="Delete"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {isBusy && !isEditing ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {isEditing ? (
          /* ── Edit form ── */
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Title</label>
              <input
                value={editForm.title}
                onChange={(e) => onEditFormChange({ title: e.target.value })}
                className="w-full text-sm font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff9900]/40 focus:border-[#ff9900]"
              />
            </div>
            {isFaculty && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Area / Place</label>
                <select
                  value={editForm.place}
                  onChange={(e) => onEditFormChange({ place: e.target.value })}
                  className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff9900]/40 focus:border-[#ff9900]"
                >
                  <option value="" disabled>Select Area</option>
                  {POST_PLACES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            )}
            {isWarden && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Room Number</label>
                <input
                  value={editForm.room_number}
                  onChange={(e) => onEditFormChange({ room_number: e.target.value })}
                  className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#ff9900]/40 focus:border-[#ff9900]"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Description</label>
              <textarea
                rows={4}
                value={editForm.description}
                onChange={(e) => onEditFormChange({ description: e.target.value })}
                className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#ff9900]/40 focus:border-[#ff9900]"
              />
            </div>
          </div>
        ) : (
          /* ── View mode ── */
          <>
            {/* Title + status */}
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-base font-bold text-gray-900 leading-snug">{post.title}</h4>
              <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">{post.description}</p>

            {/* Stage tracker */}
            <div className="flex items-center gap-2 mt-1">
              <GitBranch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <div className="flex items-center gap-1.5">
                {STAGES.map((s, idx) => {
                  const done = currentStageIdx >= 0 && idx <= currentStageIdx;
                  return (
                    <span
                      key={s}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        done
                          ? 'bg-[#2d2d2d] text-white border-[#2d2d2d]'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-3 mt-auto border-t border-gray-100">
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(post.created_at)}
              </span>
              {isFaculty && post.place && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3.5 h-3.5" /> {post.place}
                </span>
              )}
              {isWarden && post.room_number && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <BedDouble className="w-3.5 h-3.5" /> Room {post.room_number}
                </span>
              )}
              {post.assigned_je_id != null && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Wrench className="w-3.5 h-3.5" /> JE #{post.assigned_je_id}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Comments / official responses ── */}
      {!isEditing && (
        <div className="border-t border-gray-100">
          <button
            onClick={() => setCommentsOpen((o) => !o)}
            disabled={comments.length === 0}
            className="w-full flex items-center gap-2 px-5 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:cursor-default disabled:hover:bg-transparent cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
            {comments.length === 0
              ? 'No comments'
              : `${comments.length} comment${comments.length > 1 ? 's' : ''}`}
            {comments.length > 0 && (
              <ChevronDown className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${commentsOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {commentsOpen && comments.length > 0 && (
            <ul className="px-5 pb-4 space-y-3 max-h-56 overflow-y-auto">
              {comments.map((c) => (
                <li key={c.id} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-700">
                      {c.Author?.position ? c.Author.position.replace(/_/g, ' ') : `Admin #${c.author_id}`}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatDateTime(c.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{c.comment_text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
