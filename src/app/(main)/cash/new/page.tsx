'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { uploadProofFile } from '@/actions/upload';
import { createCashTransaction, getCashAccounts } from '@/actions/cash';
import { transactionCategories } from '@/lib/mockData';
import styles from './page.module.css';

export default function NewCashTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  const [type, setType] = useState('expense');
  const [accountId, setAccountId] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getCashAccounts();
        if (res.success && res.accounts) {
          setCashAccounts(res.accounts);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data rekening.');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId || !category || !amount || !date || !description) {
      setError('Harap lengkapi semua field yang wajib.');
      return;
    }

    // Client-side balance check for expense
    if (type === 'expense') {
      const account = cashAccounts.find(a => a.id === accountId);
      if (account && Number(account.balance) < Number(amount)) {
        setError(`Saldo tidak mencukupi. Saldo saat ini: Rp${new Intl.NumberFormat('id-ID').format(account.balance)}`);
        return;
      }
    }

    setLoading(true);

    try {
      let proofUrl = null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await uploadProofFile(formData);
        
        if (uploadRes.error) {
          setError(uploadRes.error);
          setLoading(false);
          return;
        }
        proofUrl = uploadRes.url;
      }

      const res = await createCashTransaction({
        accountId,
        type: type as 'income' | 'expense',
        category,
        amount: Number(amount),
        date: new Date(date),
        description,
        proofUrl: proofUrl || undefined
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push('/cash');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;

  return (
    <>
      <Topbar title="Catat Transaksi" />
      <div className={styles.page}>
        <Link href="/cash" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Catatan Transaksi</h2>
          <p className={styles.formSubtitle}>Catat transaksi kas atau tabungan.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className="alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '16px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className="label">Tipe</label>
                <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="income">Pemasukan</option>
                  <option value="expense">Pengeluaran</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className="label">Rekening</label>
                <select className="select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">Pilih rekening...</option>
                  {cashAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Rp{new Intl.NumberFormat('id-ID').format(acc.balance)})</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className="label">Kategori</label>
                <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Pilih kategori...</option>
                  {transactionCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className="label">Jumlah</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="0" 
                  value={amount ? new Intl.NumberFormat('id-ID').format(Number(amount)) : ''} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setAmount(val);
                  }} 
                />
              </div>
              <div className={styles.field}>
                <label className="label">Tanggal</label>
                <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className="label">Bukti Transfer (Opsional)</label>
                <input type="file" className="input" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className={styles.field}>
              <label className="label">Deskripsi</label>
              <textarea className="input" rows={2} placeholder="Keterangan transaksi..." style={{ resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className={styles.formActions}>
              <Link href="/cash" className="btn btn-secondary">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

