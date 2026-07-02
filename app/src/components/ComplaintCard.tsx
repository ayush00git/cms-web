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
  onCommentPosted?: () => void;
}

// ── Status config ──────────────────────────────────────────────────────────────

interface StatusStyle { label: string; pill: string; dot: string }

const STATUS_CONFIG: Record<string, StatusStyle> = {
  pending_xen:  { label: 'Pending · XEN', pill: 'bg-amber-50 text-amber-700 border-amber-200',    dot: 'bg-amber-500' },
  pending_ae:   { label: 'Pending · AE',  pill: 'bg-sky-50 text-sky-700 border-sky-200',          dot: 'bg-sky-500' },
  resolved_ae:  { label: 'Resolved · AE', pill: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-500' },
  pending_je:   { label: 'Pending · JE',  pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  resolved_je:  { label: 'Resolved · JE', pill: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-500' },
  resolved_all: { label: 'Resolved · All', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
};

const FALLBACK: StatusStyle = { label: 'Unknown', pill: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-400' };

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
    ? {
        cardBg: 'bg-white hover:bg-amber-50/10',
        accentBar: 'bg-gradient-to-b from-amber-400 to-amber-500',
        iconColor: 'text-amber-500',
        badge: 'bg-amber-50/80 text-amber-700 border-amber-200/60',
      }
    : {
        cardBg: 'bg-white hover:bg-sky-50/10',
        accentBar: 'bg-gradient-to-b from-sky-400 to-sky-500',
        iconColor: 'text-sky-500',
        badge: 'bg-sky-50/80 text-sky-700 border-sky-200/60',
      };
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
      className={`${theme.cardBg} relative border border-gray-200/80 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group flex min-h-[140px]`}
    >
      {/* Left accent bar (Linear / Vercel style) */}
      <div className={`w-1 shrink-0 ${theme.accentBar}`} />

      {/* Main card content */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        
        {/* Top line: Complaint ID, Category Badge, Status Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gray-400">#{post.id}</span>
              
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badge}`}>
                {isElectrical ? <Zap className="w-2.5 h-2.5" /> : <Hammer className="w-2.5 h-2.5" />}
                {post.type_of_post}
              </span>
            </div>

            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${status.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          {/* Title & Description */}
          <h4 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-black transition-colors mb-1">
            {post.title}
          </h4>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
            {post.description}
          </p>
        </div>

        {/* Footer row: Date, Info fields, Comments and hover arrow */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gray-100">
          <div className="flex items-center gap-4 text-gray-400">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" /> {formatDate(post.created_at)}
            </span>
            
            {isFaculty && post.place && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {post.place}
              </span>
            )}
            
            {isWarden && post.room_number && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                <BedDouble className="w-3.5 h-3.5 text-gray-400" /> Room {post.room_number}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {comments.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" /> {comments.length}
              </span>
            )}
            <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all duration-250`} />
          </div>
        </div>

      </div>
    </div>
  );
}
