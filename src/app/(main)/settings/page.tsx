'use client';

import { useState, useEffect } from 'react';
import { Save, User, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { getSystemSettings, updateSystemSettings, getAdminProfile, updateAdminProfile } from '@/actions/settings';
import styles from './page.module.css';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState({ id: '', name: 'Admin', email: 'admin@rinel.id' });
  const [payrollDay, setPayrollDay] = useState(25);

  useEffect(() => {
    async function loadSettings() {
      try {
        const [sysRes, admRes] = await Promise.all([
          getSystemSettings(),
          getAdminProfile('admin@rinel.id') // In real app, get from session
        ]);

        if (sysRes.success && sysRes.settings) {
          setPayrollDay(sysRes.settings.payrollDay);
        }
        if (admRes.success && admRes.user) {
          setAdmin({
            id: admRes.user.id,
            name: admRes.user.name,
            email: admRes.user.email
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const Swal = (await import('sweetalert2')).default;
    
    try {
      const [sysRes, admRes] = await Promise.all([
        updateSystemSettings({ payrollDay, currency: 'IDR' }),
        updateAdminProfile(admin.id, { name: admin.name, email: admin.email })
      ]);

      if (sysRes.success && admRes.success) {
        Swal.fire('Berhasil', 'Pengaturan telah diperbarui.', 'success');
      } else {
        Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Koneksi ke server bermasalah.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="Pengaturan" />
        <div style={{ padding: '80px', textAlign: 'center' }}>
          <Loader2 className="animate-spin" style={{ margin: '0 auto 16px' }} />
          <p>Memuat pengaturan...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Pengaturan" subtitle="Konfigurasi akun dan sistem" />
      <div className={styles.page}>
        <div className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <User size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Profil Admin</h3>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className="label">Nama Lengkap</label>
              <input 
                type="text" 
                className="input" 
                value={admin.name} 
                onChange={(e) => setAdmin({ ...admin, name: e.target.value })} 
              />
            </div>
            <div className={styles.field}>
              <label className="label">Email Admin</label>
              <input 
                type="email" 
                className="input" 
                value={admin.email} 
                onChange={(e) => setAdmin({ ...admin, email: e.target.value })} 
              />
            </div>
          </div>
        </div>

        <div className={`card ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <SettingsIcon size={20} className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Konfigurasi Sistem</h3>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className="label">Tanggal Gajian</label>
              <select 
                className="select" 
                value={payrollDay} 
                onChange={(e) => setPayrollDay(Number(e.target.value))}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>Tanggal {d}</option>
                ))}
              </select>
              <p className="help-text" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Akan muncul sebagai countdown gajian di Dashboard.
              </p>
            </div>
            <div className={styles.field}>
              <label className="label">Mata Uang Default</label>
              <select className="select" value="IDR" disabled>
                <option value="IDR">IDR — Rupiah</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.saveRow}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? ' Menyimpan...' : ' Simpan Perubahan'}
          </button>
        </div>
      </div>
    </>
  );
}

