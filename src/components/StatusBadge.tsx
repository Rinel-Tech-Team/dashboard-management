import styles from './StatusBadge.module.css';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'teal' | 'indigo';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const statusMap: Record<string, BadgeVariant> = {
  active: 'success',
  inactive: 'neutral',
  cuti: 'warning',
  resign: 'danger',
  planning: 'info',
  development: 'warning',
  testing: 'indigo',
  finished: 'success',
  canceled: 'danger',
  pending: 'warning',
  unpaid: 'warning',
  partial: 'info',
  paid: 'success',
  overdue: 'danger',
  // New Project Statuses
  'Requirement/Planning': 'info',
  'Design': 'teal',
  'Development': 'warning',
  'Testing': 'indigo',
  'Deployment/Finished': 'success',
  'Canceled': 'danger',
};

const labelMap: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Non-Aktif',
  cuti: 'Cuti',
  resign: 'Resign',
  planning: 'Planning',
  development: 'Development',
  testing: 'Testing',
  finished: 'Finished',
  canceled: 'Canceled',
  pending: 'Pending',
  unpaid: 'Unpaid',
  partial: 'Partial',
  paid: 'Paid',
  overdue: 'Overdue',
  // New Project Statuses
  'Requirement/Planning': 'Requirement/Planning',
  'Design': 'Design',
  'Development': 'Development',
  'Testing': 'Testing',
  'Deployment/Finished': 'Deployment/Finished',
  'Canceled': 'Canceled',
};

export default function StatusBadge({ label, variant }: StatusBadgeProps) {
  const resolvedVariant = variant || statusMap[label] || 'neutral';
  const displayLabel = labelMap[label] || label;

  return (
    <span className={`${styles.badge} ${styles[resolvedVariant]}`}>
      <span className={styles.dot} />
      {displayLabel}
    </span>
  );
}
