'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ConfirmModal from '@/components/ConfirmModal';
import { deleteInvoice } from '@/actions/invoices';
import { formatCurrency, formatDate } from '@/lib/mockData';
import styles from './page.module.css';

const INVOICE_STATUSES = ['pending', 'partial', 'paid', 'overdue'] as const;

interface InvoicesClientProps {
  initialData: any[];
}

export default function InvoicesClient({ initialData }: InvoicesClientProps) {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = initialData.filter((inv) => {
    const matchStatus = !statusFilter || inv.status === statusFilter;
    const matchSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.projectName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalAll = initialData.reduce((s, i) => s + i.amount, 0);
  const totalPaid = initialData.reduce((s, i) => s + i.paidAmount, 0);

  const handleOpenDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    
    try {
      const res = await deleteInvoice(deletingId);
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Invoice berhasil dihapus');
        setIsConfirmOpen(false);
      }
    } catch (err) {
      alert('Gagal menghapus invoice');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Daftar Invoice"
        subtitle={`${initialData.length} invoice — Total ${formatCurrency(totalAll)} (Terbayar: ${formatCurrency(totalPaid)})`}
        actionLabel="Buat Invoice"
        actionHref="/invoices/new"
      />

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nomor atau proyek..."
            className={`input ${styles.searchInput}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.statusFilters}>
          <button
            className={`${styles.filterBtn} ${!statusFilter ? styles.active : ''}`}
            onClick={() => setStatusFilter('')}
          >
            Semua
          </button>
          
          {INVOICE_STATUSES.map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusFilter === s ? styles.active : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>Proyek</th>
              <th>Jumlah</th>
              <th>Terbayar</th>
              <th>Tanggal</th>
              <th>Jatuh Tempo</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td className={styles.mono}>{inv.number}</td>
                <td>{inv.projectName}</td>
                <td className={styles.mono}>{formatCurrency(inv.amount)}</td>
                <td className={styles.mono}>{formatCurrency(inv.paidAmount)}</td>
                <td>{formatDate(inv.issuedDate)}</td>
                <td>{formatDate(inv.dueDate)}</td>
                <td><StatusBadge label={inv.status} /></td>
                <td>
                  <Link href={`/invoices/${inv.id}`} className="btn btn-ghost btn-icon btn-sm" title="Lihat">
                    <Eye size={15} />
                  </Link>
                  <Link href={`/invoices/${inv.id}/edit`} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                    <Pencil size={15} />
                  </Link>
                  <button 
                    className="btn btn-ghost btn-icon btn-sm" 
                    style={{ color: 'var(--status-danger)' }} 
                    title="Hapus"
                    onClick={(e) => handleOpenDelete(e, inv.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  Tidak ada invoice yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Hapus Invoice"
        message="Apakah Anda yakin ingin menghapus invoice ini? Aksi ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        danger={true}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
