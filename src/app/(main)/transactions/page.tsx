'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowUpRight, ArrowDownRight, Eye, Pencil, Trash2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { getTransactions, deleteTransaction } from '@/actions/transactions';
import styles from './page.module.css';

// Formatting helpers
const formatCurrency = (amount: number | string) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const formatDate = (dateStr: string | Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

const typeFilters = ['Sewa', 'Operasional', 'Pembayaran Proyek'];

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    const res = await getTransactions();
    if (res.success && res.transactions) {
      setTransactions(res.transactions);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Saldo kas dan status invoice terkait akan dikembalikan ke kondisi semula.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--status-danger)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      const res = await deleteTransaction(id);
      if (res.success) {
        Swal.fire('Terhapus!', 'Transaksi berhasil dihapus.', 'success');
        fetchTransactions();
        router.refresh();
      } else {
        Swal.fire('Gagal', res.error || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || t.category === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <>
      <Topbar title="Transaksi" subtitle="Kelola catatan kas dan mutasi rekening" />
      <div className={styles.page}>
        <PageHeader
          title="Daftar Transaksi"
          subtitle={`${transactions.length} transaksi tercatat`}
          actionLabel="Catat Transaksi"
          actionHref="/transactions/new"
        />

        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Cari transaksi..."
              className={`input ${styles.searchInput}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.statusFilters}>
            <button
              className={`${styles.filterBtn} ${!typeFilter ? styles.active : ''}`}
              onClick={() => setTypeFilter('')}
            >
              Semua
            </button>
            {typeFilters.map((t) => (
              <button
                key={t}
                className={`${styles.filterBtn} ${typeFilter === t ? styles.active : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat data...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi</th>
                  <th>Kategori</th>
                  <th>Rekening</th>
                  <th>Jumlah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      Tidak ada data transaksi.
                    </td>
                  </tr>
                ) : (
                  filtered.map((txn) => (
                    <tr key={txn.id}>
                      <td>{formatDate(txn.date)}</td>
                      <td>
                        <div className={styles.descCell}>
                          <div className={`${styles.dot} ${txn.type === 'income' ? styles.dotIn : styles.dotOut}`}>
                            {txn.type === 'income' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          </div>
                          {txn.description}
                        </div>
                      </td>
                      <td><span className={styles.typeBadge}>{txn.category}</span></td>
                      <td>{txn.account?.name || 'Kas'}</td>
                      <td className={`${styles.mono} ${txn.type === 'income' ? styles.amtIn : styles.amtOut}`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <Link href={`/transactions/${txn.id}`} className="btn btn-ghost btn-icon btn-sm" title="Lihat">
                            <Eye size={14} />
                          </Link>
                          <Link href={`/transactions/${txn.id}/edit`} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                            <Pencil size={14} />
                          </Link>
                          <button 
                            className="btn btn-ghost btn-icon btn-sm" 
                            style={{ color: 'var(--status-danger)' }} 
                            title="Hapus"
                            onClick={() => handleDelete(txn.id)}
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
    </>
  );
}
