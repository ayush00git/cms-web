import { useNavigate } from 'react-router-dom';
import {
  Zap, Hammer, Calendar, MapPin, BedDouble, MessageSquare, ChevronRight,
} from 'lucide-react';


// ── Types ─────────────────────────────────────────────────────────────────────

export type Role = 'faculty' | 'warden' | 'centrehead';

export interface ComplaintComment {
  id: number;
  comment_text: string;
  email: string;
  role: string;
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
  isEditing?: boolean;
  isBusy?: boolean;
  editForm?: EditForm;
  onEditFormChange?: (patch: Partial<EditForm>) => void;
  onStartEdit?: (post: ComplaintPost) => void;
  onCancelEdit?: () => void;
  onSaveEdit?: (postId: number) => void;
  onDelete?: (postId: number) => void;
  // Called after the author successfully posts a comment, so the parent can
  // refetch and surface the new comment.
  onCommentPosted?: () => void;
}

// ── Status config ──────────────────────────────────────────────────────────────

interface StatusStyle { label: string; pill: string; dot: string }

const STATUS_CONFIG: Record<string, StatusStyle> = {
  pending_xen:  { label: 'Pending · XEN', pill: 'bg-amber-100 text-amber-800 border-amber-300',    dot: 'bg-amber-400' },
  pending_ae:   { label: 'Pending · AE',  pill: 'bg-sky-100 text-sky-800 border-sky-300',          dot: 'bg-sky-400' },
  resolved_ae:  { label: 'Resolved · AE', pill: 'bg-teal-100 text-teal-800 border-teal-300',      dot: 'bg-teal-400' },
  pending_je:   { label: 'Pending · JE',  pill: 'bg-violet-100 text-violet-800 border-violet-300', dot: 'bg-violet-400' },
  resolved_je:  { label: 'Resolved · JE', pill: 'bg-teal-100 text-teal-800 border-teal-300',      dot: 'bg-teal-400' },
  resolved_all: { label: 'Resolved · All', pill: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
};

const FALLBACK: StatusStyle = { label: 'Unknown', pill: 'bg-gray-100 text-gray-600 border-gray-300', dot: 'bg-gray-400' };

function statusStyle(s: string): StatusStyle {
  const norm = s.toLowerCase();
  return STATUS_CONFIG[norm] ?? { ...FALLBACK, label: s.replace(/_/g, ' ') };
}


function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Type theme ─────────────────────────────────────────────────────────────────

function typeTheme(isElectrical: boolean) {
  return isElectrical
    ? { cardBg: 'bg-amber-50',  accentBar: 'bg-amber-400',  headerBg: 'bg-amber-100/70', iconColor: 'text-amber-600', badge: 'bg-amber-200 text-amber-900 border-amber-400', stageDone: 'bg-amber-500 border-amber-500' }
    : { cardBg: 'bg-sky-50',    accentBar: 'bg-sky-500',    headerBg: 'bg-sky-100/70',   iconColor: 'text-sky-600',   badge: 'bg-sky-200 text-sky-900 border-sky-400',       stageDone: 'bg-sky-600 border-sky-600' };
}


// ── Card (compact preview) ─────────────────────────────────────────────────────

export function ComplaintCard({
  post, role,
}: ComplaintCardProps) {
  const navigate = useNavigate();

  const status       = statusStyle(post.status);
  const isElectrical = post.type_of_post === 'Electrical';
  const theme        = typeTheme(isElectrical);
  const comments     = post.comments ?? [];
  const isFaculty    = role === 'faculty';
  const isWarden     = role === 'warden';

  return (
    <div
      onClick={() => navigate(`/post/${role}/${post.id}`)}
      className={`${theme.cardBg} border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group`}
    >
      {/* Top accent */}
      <div className={`h-1 w-full ${theme.accentBar}`} />

      <div className="px-4 py-4">
        {/* Row 1: badges */}
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
  );
}
