import { type ReactNode } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: ReactNode;
  onAction?: () => void;
}

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  actionIcon,
  onAction,
}: PageHeaderProps) {
  const buttonContent = (
    <>
      {actionIcon || <Plus size={16} />}
      {actionLabel}
    </>
  );

  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className={`btn btn-primary ${styles.action}`}>
            {buttonContent}
          </Link>
        ) : (
          <button onClick={onAction} className={`btn btn-primary ${styles.action}`}>
            {buttonContent}
          </button>
        )
      )}
    </div>
  );
}
