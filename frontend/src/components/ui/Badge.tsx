type Status = 'active' | 'pending' | 'rejected' | string;

interface BadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  },
  admin: {
    label: 'Admin',
    className: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  },
  student: {
    label: 'Student',
    className: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',
  },
};

export default function Badge({ status, className = '' }: BadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
