interface LoaderProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'dark' | 'orange' | 'rose';
  className?: string;
}

export function Loader({ size = 'md', color = 'dark', className = '' }: LoaderProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    white: 'border-white/20 border-t-white',
    dark: 'border-zinc-200 border-t-zinc-800',
    orange: 'border-amber-100 border-t-amber-500',
    rose: 'border-rose-100 border-t-rose-500',
  };

  return (
    <div
      className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
}
