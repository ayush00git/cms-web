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
      badgeClass: 'bg-violet-50/80 text-violet-700 border-violet-150',
      avatarClass: 'bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-violet-100',
      initials: 'FC',
    };
  }
  if (norm.includes('warden')) {
    return {
      label: 'Warden',
      badgeClass: 'bg-amber-50/80 text-amber-700 border-amber-150',
      avatarClass: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-100',
      initials: 'WD',
    };
  }
  if (norm.includes('centrehead') || norm.includes('centre_head')) {
    return {
      label: 'Centre Head',
      badgeClass: 'bg-sky-50/80 text-sky-700 border-sky-150',
      avatarClass: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-100',
      initials: 'CH',
    };
  }
  if (norm.includes('xen')) {
    return {
      label: 'XEN Admin',
      badgeClass: 'bg-emerald-50/80 text-emerald-700 border-emerald-150',
      avatarClass: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-100',
      initials: 'XN',
    };
  }
  if (norm.includes('ae')) {
    return {
      label: 'Assistant Engineer',
      badgeClass: 'bg-indigo-50/80 text-indigo-700 border-indigo-150',
      avatarClass: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-indigo-100',
      initials: 'AE',
    };
  }
  if (norm.includes('je')) {
    return {
      label: 'Junior Engineer',
      badgeClass: 'bg-rose-50/80 text-rose-700 border-rose-150',
      avatarClass: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-100',
      initials: 'JE',
    };
  }
  return {
    label: role ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Staff',
    badgeClass: 'bg-zinc-50 text-zinc-700 border-zinc-200',
    avatarClass: 'bg-gradient-to-br from-zinc-500 to-slate-600 text-white shadow-zinc-100',
    initials: role ? role.slice(0, 2).toUpperCase() : 'ST',
  };
}

export function CommentBox({ comment }: CommentBoxProps) {
  const config = getRoleConfig(comment.role);

  return (
    <div className="relative pl-10 group">
      {/* Precision-aligned Connector Dot */}
      <div className="absolute left-[10px] top-[26px] w-3 h-3 rounded-full border-[2.5px] border-white bg-zinc-300 group-hover:bg-zinc-800 transition-colors duration-300 z-10 shadow-sm" />

      {/* Unified Professional Comment Box */}
      <div className="bg-white border border-zinc-200/70 rounded-xl p-5 hover:border-zinc-300 hover:shadow-md/5 hover:shadow-sm transition-all duration-300 flex gap-4">
        
        {/* Avatar (Left Column) */}
        <div className="shrink-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono tracking-wider ${config.avatarClass} border border-white shadow-sm`}>
            {config.initials}
          </div>
        </div>

        {/* Info & Content (Right Column) */}
        <div className="flex-grow min-w-0 space-y-2">
          
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
            <div className="inline-flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
              <Clock className="w-3 h-3 text-zinc-300" />
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
