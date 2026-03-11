'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, LogOut, ChevronDown, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { getNotificationData } from '@/actions/notifications';
import { globalSearch } from '@/actions/search';
import { logout } from '@/actions/auth';
import styles from './Topbar.module.css';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifs() {
      const res = await getNotificationData();
      if (res.success && res.notifications) {
        const readIds = JSON.parse(localStorage.getItem('read-notifs') || '[]');
        const unread = res.notifications.filter((n: any) => !readIds.includes(n.id));
        setNotifications(unread);
        setUnreadCount(unread.length);
      }
    }
    fetchNotifs();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = () => {
    const readIds = JSON.parse(localStorage.getItem('read-notifs') || '[]');
    const newReadIds = [...new Set([...readIds, ...notifications.map(n => n.id)])];
    localStorage.setItem('read-notifs', JSON.stringify(newReadIds));
    setNotifications([]);
    setUnreadCount(0);
  };

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [serverResults, setServerResults] = useState<{type: string, label: string, href: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.length > 1) {
      setIsSearching(true);
      globalSearch(debouncedQuery)
        .then(res => setServerResults(res))
        .catch(console.error)
        .finally(() => setIsSearching(false));
    } else {
      setServerResults([]);
    }
  }, [debouncedQuery]);

  const searchablePages = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Karyawan', href: '/employees' },
    { label: 'Departemen', href: '/departments' },
    { label: 'Proyek', href: '/projects' },
    { label: 'Invoice', href: '/invoices' },
    { label: 'Payroll', href: '/payroll' },
    { label: 'Transaksi', href: '/transactions' },
    { label: 'Kas & Tabungan', href: '/cash' },
    { label: 'Pengaturan', href: '/settings' },
    { label: 'Tambah Karyawan', href: '/employees/new' },
    { label: 'Proyek Baru', href: '/projects/new' },
    { label: 'Buat Invoice', href: '/invoices/new' },
    { label: 'Buat Payroll', href: '/payroll/new' },
    { label: 'Catat Transaksi', href: '/transactions/new' },
  ];

  const pageResults = searchQuery.length > 0
    ? searchablePages.filter((p) => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const combinedResults = [
    ...pageResults.map(p => ({ ...p, type: 'Halaman' })),
    ...serverResults
  ];

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      window.localStorage.removeItem('rinel-auth');
    } catch (e) {
      console.warn('localStorage access denied');
    }
    await logout();
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hari ini';
    if (diff === 1) return 'Kemarin';
    if (diff < 7) return `${diff} hari lalu`;
    return d.toLocaleDateString('id-ID');
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.right}>
        {/* Search */}
        <div className={styles.searchWrap} ref={searchRef}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari halaman atau data..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
              onFocus={() => setShowSearch(true)}
            />
          </div>
          {showSearch && (searchQuery.length > 0) && (
            <div className={styles.dropdown}>
              {combinedResults.length > 0 ? (
                combinedResults.map((r, idx) => (
                  <Link
                    key={`${r.href}-${idx}`}
                    href={r.href}
                    className={styles.dropdownItem}
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem' }}>{r.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{r.type}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '8px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {isSearching ? 'Mencari...' : 'Tidak ada hasil'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className={styles.notifWrap} ref={notifRef}>
          <button
            className={styles.iconBtn}
            title="Notifikasi"
            onClick={() => setShowNotif(!showNotif)}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
          </button>
          {showNotif && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownTitle}>
                Notifikasi
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className={styles.markAllBtn}>
                    Hapus Semua
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Tidak ada notifikasi baru.
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = n.category === 'payroll' ? CreditCard : AlertTriangle;
                  return (
                    <div key={n.id} className={styles.notifItem}>
                      <div className={`${styles.notifIcon} ${styles[`notif_${n.type}`]}`}>
                        <Icon size={14} />
                      </div>
                      <div className={styles.notifContent}>
                        <span className={styles.notifText}>{n.text}</span>
                        <span className={styles.notifTime}>{formatDateLabel(n.time)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.profileWrap} ref={profileRef}>
          <button className={styles.profileBtn} onClick={() => setShowProfile(!showProfile)}>
            <div className={styles.avatar}>AD</div>
            <ChevronDown size={14} className={styles.profileChevron} />
          </button>
          {showProfile && (
            <div className={styles.dropdown}>
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>Admin</span>
                <span className={styles.profileRole}>Administrator</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={14} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
