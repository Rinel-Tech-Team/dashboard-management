import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md';
  color?: 'teal' | 'indigo' | 'warning' | 'danger';
  showLabel?: boolean;
}

export default function ProgressBar({
  progress,
  size = 'md',
  color = 'teal',
  showLabel = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.track} ${styles[size]}`}>
        <div
          className={`${styles.fill} ${styles[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showLabel && (
        <span className={styles.label}>{clampedProgress}%</span>
      )}
    </div>
  );
}
