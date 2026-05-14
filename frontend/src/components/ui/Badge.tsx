type Status = 'active' | 'pending' | 'rejected' | string;

interface BadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  },
  admin: {
    label: 'Admin',
    className: 'bg-teal-100 text-teal-800 ring-1 ring-teal-300',
  },
  student: {
    label: 'Student',
    className: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
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
