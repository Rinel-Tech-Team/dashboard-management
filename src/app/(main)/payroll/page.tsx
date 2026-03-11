'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Pencil, Trash2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ConfirmModal from '@/components/ConfirmModal';
import { formatDate } from '@/lib/mockData';
import { getPayrolls, deletePayroll } from '@/actions/payroll';
import styles from './page.module.css';

// Reusable formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPayrolls();
  }, []);

  async function loadPayrolls() {
    setLoading(true);
    const res = await getPayrolls();
    if (res.success && res.payrolls) {
      setPayrolls(res.payrolls);
    }
    setLoading(false);
  }

  const handleDeleteTrigger = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deletePayroll(deletingId);
      if (res.success) {
        await loadPayrolls();
      } else {
        alert(res.error || 'Gagal menghapus payroll');
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    }
  };

  const filtered = payrolls.filter((p) =>
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    p.period.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Payroll" subtitle="Kelola penggajian, THR, bonus, dan lembur" />
      <div className={styles.page}>
        <PageHeader
          title="Riwayat Payroll"
          subtitle={`${payrolls.length} transaksi payroll`}
          actionLabel="Buat Payroll"
          actionHref="/payroll/new"
        />

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari tipe atau periode payroll..."
              className={`input ${styles.searchInput}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Memuat data...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tipe</th>
                  <th>Periode</th>
                  <th>Jumlah Karyawan</th>
                  <th>Total</th>
                  <th>Rekening</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>
                      Tidak ada data payroll ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((pr) => (
                    <tr key={pr.id}>
                      <td><span className={styles.typeBadge}>{pr.type}</span></td>
                      <td>{pr.period}</td>
                      <td>{pr.employeeCount} orang</td>
                      <td className={styles.mono}>{formatCurrency(Number(pr.totalAmount))}</td>
                      <td>{pr.account?.name || 'Unknown'}</td>
                      <td>{formatDate(pr.date)}</td>
                      <td><StatusBadge label={pr.status} /></td>
                      <td>
                        <div className={styles.actions}>
                          <Link href={`/payroll/${pr.id}`} className="btn btn-ghost btn-icon btn-sm" title="Lihat">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/payroll/${pr.id}/edit`} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                            <Pencil size={14} />
                          </Link>
                          <button 
                            className="btn btn-ghost btn-icon btn-sm" 
                            style={{ color: 'var(--status-danger)' }} 
                            title="Hapus"
                            onClick={() => handleDeleteTrigger(pr.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Hapus Data Payroll"
        message="Apakah Anda yakin ingin menghapus data payroll ini? Aksi ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        danger={true}
        loading={isDeleting}
      />
    </>
  );
}
