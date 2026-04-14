interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  PAID: 'bg-secondary-container/40 text-on-secondary-container',
  APPROVED: 'bg-primary/20 text-primary',
  ACTIVE: 'bg-secondary-container/40 text-on-secondary-container',
  OVERDUE: 'bg-error-container/40 text-error',
  DUE_TODAY: 'bg-accent/10 text-accent',
  UPCOMING: 'bg-tertiary-fixed-dim/30 text-on-tertiary-fixed-variant',
  PENDING: 'bg-amber-100 text-amber-700',
  CLEARED: 'bg-surface-container-highest text-on-surface-variant',
  CLOSED: 'bg-surface-container-highest text-on-surface-variant',
  REJECTED: 'bg-error-container/40 text-error',
  QUERIED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-secondary-container/40 text-on-secondary-container',
  DELIVERED: 'bg-accent/10 text-accent',
  FAILED: 'bg-error-container/40 text-error',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-surface-container-high text-on-surface-variant';
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-[10px]' : 'px-4 py-1.5 text-xs';

  return (
    <span className={`${sizeClass} rounded-full font-bold uppercase tracking-wide ${style}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
