interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

export default function LoadingSpinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      className={`${sizes[size]} rounded-full border-current border-r-transparent animate-spin inline-block ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" className="text-indigo-600" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}
