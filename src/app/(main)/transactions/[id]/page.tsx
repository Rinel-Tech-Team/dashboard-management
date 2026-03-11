'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/StatusBadge';
import { getTransactionById, deleteTransaction } from '@/actions/transactions';
import styles from '../page.module.css';

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
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
};

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [txn, setTxn] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await getTransactionById(id);
      if (res.success) {
        setTxn(res.transaction);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleDelete = async () => {
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
      const res = await deleteTransaction(txn.id);
      if (res.success) {
        Swal.fire('Terhapus!', 'Transaksi berhasil dihapus.', 'success');
        router.push('/transactions');
      } else {
        Swal.fire('Gagal', res.error || 'Terjadi kesalahan.', 'error');
      }
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;
  if (!txn) return <div style={{ padding: '40px', textAlign: 'center' }}>Transaksi tidak ditemukan.</div>;

  const isIncome = txn.type === 'income';

  return (
    <>
      <Topbar title="Detail Transaksi" />
      <div className={styles.page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link href="/transactions" className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Kembali ke Daftar
          </Link>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={`/transactions/${txn.id}/edit`} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pencil size={16} /> Edit
            </Link>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--status-danger)', borderColor: 'var(--status-danger)' }} onClick={handleDelete}>
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        </div>

        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '12px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isIncome ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isIncome ? '#22c55e' : '#ef4444'
            }}>
              {isIncome ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {isIncome ? '+' : '-'}{formatCurrency(txn.amount)}
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>{txn.description}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kategori</p>
              <p style={{ fontWeight: 500 }}>{txn.category}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</p>
              <p style={{ fontWeight: 500 }}>{formatDate(txn.date)}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rekening Terkait</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{txn.account?.icon || '🏦'}</span>
                <span style={{ fontWeight: 500 }}>{txn.account?.name || 'Kas/Bank'}</span>
              </div>
            </div>
            {txn.invoice && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nomor Invoice</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 500 }}>{txn.invoice.number}</span>
                  <StatusBadge label={txn.invoice.status} />
                </div>
              </div>
            )}
          </div>

          {txn.proofUrl && (
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bukti Transaksi</p>
              <a href={txn.proofUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>
                <FileText size={16} /> Lihat / Unduh Bukti
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
