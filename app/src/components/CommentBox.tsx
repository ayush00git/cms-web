import { Clock } from 'lucide-react';

interface CommentBoxProps {
  comment: {
    id: number;
    comment_text: string;
    email: string;
    role: string;
    created_at: string;
  };
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRoleConfig(role: string) {
  const norm = (role || '').toLowerCase();
  if (norm.includes('faculty')) {
    return {
      label: 'Faculty',
      badgeClass: 'bg-violet-50/80 text-violet-700 border-violet-100',
    };
  }
  if (norm.includes('warden')) {
    return {
      label: 'Warden',
      badgeClass: 'bg-amber-50/80 text-amber-700 border-amber-100',
    };
  }
  if (norm.includes('centrehead') || norm.includes('centre_head')) {
    return {
      label: 'Centre Head',
      badgeClass: 'bg-sky-50/80 text-sky-700 border-sky-100',
    };
  }
  if (norm.includes('xen')) {
    return {
      label: 'XEN Admin',
      badgeClass: 'bg-emerald-50/80 text-emerald-700 border-emerald-100',
    };
  }
  if (norm.includes('ae')) {
    return {
      label: 'Assistant Engineer',
      badgeClass: 'bg-indigo-50/80 text-indigo-700 border-indigo-100',
    };
  }
  if (norm.includes('je')) {
    return {
      label: 'Junior Engineer',
      badgeClass: 'bg-rose-50/80 text-rose-700 border-rose-100',
    };
  }
  return {
    label: role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Staff',
    badgeClass: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  };
}

export function CommentBox({ comment }: CommentBoxProps) {
  const config = getRoleConfig(comment.role);

  return (
    <div className="relative pl-10 group">
      {/* Precision-aligned Connector Dot */}
      <div className="absolute left-[10px] top-[26px] w-3 h-3 rounded-full border-[2.5px] border-white bg-zinc-300 group-hover:bg-zinc-800 transition-colors duration-300 z-10 shadow-sm" />

      {/* Unified Professional Comment Box */}
      <div className="bg-white border border-zinc-200/70 rounded-xl p-5 hover:border-zinc-300 hover:shadow-md/5 hover:shadow-sm transition-all duration-300">
        
        {/* Info & Content */}
        <div className="space-y-2">
          
          {/* Header metadata row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-800 tracking-tight">
                {config.label}
              </span>
              <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${config.badgeClass}`}>
                {comment.role || 'Staff'}
              </span>
              {comment.email && (
                <span className="text-[10px] text-zinc-400 font-medium">
                  ({comment.email})
                </span>
              )}
            </div>

            {/* Time label */}
            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-normal">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {formatDateTime(comment.created_at)}
            </div>
          </div>

          {/* Message Content */}
          <div className="text-[12.5px] text-zinc-600 leading-relaxed whitespace-pre-wrap font-normal select-text">
            {comment.comment_text}
          </div>

        </div>

      </div>
    </div>
  );
}
