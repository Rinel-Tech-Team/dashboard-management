'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Building,
  CreditCard,
  ArrowRightLeft,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Karyawan', href: '/employees' },
  { icon: Building, label: 'Departemen', href: '/departments' },
  { icon: FolderKanban, label: 'Proyek', href: '/projects' },
  { icon: FileText, label: 'Invoice', href: '/invoices' },
  { icon: CreditCard, label: 'Payroll', href: '/payroll' },
  { icon: ArrowRightLeft, label: 'Transaksi', href: '/transactions' },
  { icon: Wallet, label: 'Kas & Tabungan', href: '/cash' },
  { icon: Settings, label: 'Pengaturan', href: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon} style={{ width: '40px', height: '40px', position: 'relative', overflow: 'hidden' }}>
          <img 
            src="/logo.png" 
            alt="Rinel Tech Nusantara" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
          />
        </div>
        {!collapsed && (
          <div className={styles.logoText}>
            <span className={styles.logoTitle} style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>
              Rinel Tech Nusantara
            </span>
            <span className={styles.logoSub}>Management</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} className={styles.navIcon} />
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {isActive && <div className={styles.activeBar} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer — collapse only */}
      <div className={styles.footer}>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
