'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Plus, Loader2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { getCashAccounts, getTransactions } from '@/actions/cash';
import { formatCurrency, formatDate, transactionCategories } from '@/lib/mockData';
import styles from './page.module.css';

export default function CashPage() {
  const [catFilter, setCatFilter] = useState('');
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [accRes, trxRes] = await Promise.all([
          getCashAccounts(),
          getTransactions()
        ]);
        
        if (accRes.success && accRes.accounts) {
          setCashAccounts(accRes.accounts);
        }
        
        if (trxRes.success && trxRes.transactions) {
          setTransactions(trxRes.transactions);
        }
      } catch (err) {
        console.error('Failed to load cash data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalBalance = cashAccounts.reduce((s, a) => s + Number(a.balance || 0), 0);

  // Only show kas/tabungan transactions (exclude irrelevant categories)
  const cashTransactions = transactions.filter(
    (t) => t.category !== 'Gaji' && t.category !== 'Operasional' && t.category !== 'Pembayaran Proyek'
  );

  const filtered = catFilter
    ? cashTransactions.filter((t) => t.category === catFilter)
    : cashTransactions;

  if (loading) {
    return (
      <>
        <Topbar title="Kas & Tabungan" subtitle="Pantau saldo dan histori transaksi" />
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader2 className="animate-spin" style={{ marginRight: '8px' }} /> Memuat data...
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Kas & Tabungan" subtitle="Pantau saldo dan histori transaksi" />
      <div className={styles.page}>
        {/* Total Balance */}
        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>Total Saldo Semua Rekening</span>
          <span className={styles.totalValue}>{formatCurrency(totalBalance)}</span>
        </div>

        {/* Account Cards */}
        <div className={`${styles.accountsGrid} stagger-children`}>
          {cashAccounts.map((acc) => (
            <div key={acc.id} className={styles.accountCard}>
              <div className={styles.accIcon}>{acc.icon}</div>
              <div className={styles.accInfo}>
                <span className={styles.accName}>{acc.name}</span>
                <span className={styles.accBank}>{acc.bank}</span>
              </div>
              <span className={styles.accBalance}>{formatCurrency(acc.balance)}</span>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className={styles.transactionsSection}>
          <div className={styles.trxHeader}>
            <h3 className={styles.sectionTitle}>Riwayat Transaksi</h3>
            <div className={styles.trxActions}>
              <select
                className="select"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                style={{ width: 'auto', minWidth: 160 }}
              >
                <option value="">Semua Kategori</option>
                {transactionCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <Link href="/cash/new" className="btn btn-primary btn-sm">
                <Plus size={14} /> Catat Transaksi
              </Link>
            </div>
          </div>

          <div className={styles.tableWrap}>
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
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                      Belum ada transaksi.
                    </td>
                  </tr>
                ) : (
                  filtered.map((trx) => {
                    const account = cashAccounts.find((a) => a.id === trx.accountId);
                    
                    const handleDelete = async (id: string) => {
                      const Swal = (await import('sweetalert2')).default;
                      const result = await Swal.fire({
                        title: 'Hapus Transaksi?',
                        text: 'Saldo rekening akan dikembalikan ke kondisi semula.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: 'var(--status-danger)',
                        cancelButtonColor: 'var(--text-muted)',
                        confirmButtonText: 'Ya, Hapus',
                        cancelButtonText: 'Batal'
                      });

                      if (result.isConfirmed) {
                        try {
                          const { deleteCashTransaction } = await import('@/actions/cash');
                          const res = await deleteCashTransaction(id);
                          if (res.success) {
                            Swal.fire('Terhapus!', 'Transaksi berhasil dihapus.', 'success');
                            // Refresh local state if needed, but revalidatePath should handle it if using Server Components.
                            // Since this is a client component, we might need to manually update state or re-fetch.
                            setTransactions(prev => prev.filter(t => t.id !== id));
                          } else {
                            Swal.fire('Gagal', res.error || 'Terjadi kesalahan.', 'error');
                          }
                        } catch (err) {
                          console.error(err);
                          Swal.fire('Gagal', 'Terjadi kesalahan sistem.', 'error');
                        }
                      }
                    };

                    return (
                      <tr key={trx.id}>
                        <td>{formatDate(trx.date)}</td>
                        <td>
                          <div className={styles.trxDescCell}>
                            <div
                              className={`${styles.trxDot} ${
                                trx.type === 'income' ? styles.dotIncome : styles.dotExpense
                              }`}
                            >
                              {trx.type === 'income' ? (
                                <ArrowUpRight size={12} />
                              ) : (
                                <ArrowDownRight size={12} />
                              )}
                            </div>
                            {trx.description}
                          </div>
                        </td>
                        <td>
                          <span className={styles.catBadge}>{trx.category}</span>
                        </td>
                        <td>{account?.name || '-'}</td>
                        <td
                          className={`${styles.mono} ${
                            trx.type === 'income' ? styles.amountIncome : styles.amountExpense
                          }`}
                        >
                          {trx.type === 'income' ? '+' : '-'}
                          {formatCurrency(trx.amount)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <Link href={`/cash/${trx.id}`} className="btn btn-ghost btn-sm" title="Lihat Detail">
                              <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                            </Link>
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ color: 'var(--status-danger)' }}
                              onClick={() => handleDelete(trx.id)}
                              title="Hapus"
                            >
                              <ArrowUpRight size={14} style={{ transform: 'rotate(90deg)' }} /> 
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
