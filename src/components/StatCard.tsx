import { type ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  accent?: 'teal' | 'indigo' | 'warning' | 'danger';
}

export default function StatCard({
  icon,
  label,
  value,
  change,
  changeType = 'neutral',
  accent = 'teal',
}: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {change && (
          <span className={`${styles.change} ${styles[changeType]}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
