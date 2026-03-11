'use client';

import { useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Use useLayoutEffect for synchronous check before paint — avoids spinner flash
  useLayoutEffect(() => {
    let authData = null;
    try {
      authData = window.localStorage.getItem('rinel-auth');
    } catch (e) {
      console.warn('localStorage is blocked, falling back to server cookie check');
      setChecked(true);
      return;
    }

    if (!authData) {
      router.replace('/login');
      return;
    }
    try {
      const parsed = JSON.parse(authData);
      if (!parsed.isLoggedIn) {
        router.replace('/login');
        return;
      }
    } catch {
      router.replace('/login');
      return;
    }
    setChecked(true);
  }, [router]); // Only check once on mount, not on every pathname change

  if (!checked) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

