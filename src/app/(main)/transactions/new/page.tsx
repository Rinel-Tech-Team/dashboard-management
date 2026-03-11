'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { uploadProofFile } from '@/actions/upload';
import { createTransaction } from '@/actions/transactions';
import { getInvoices } from '@/actions/invoices';
import { getCashAccounts } from '@/actions/cash';
import { transactionTypes } from '@/lib/mockData';
import styles from './page.module.css';

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const [cashAccounts, setCashAccounts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [txnType, setTxnType] = useState('Sewa');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('partial');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [invs, accounts] = await Promise.all([
          getInvoices(),
          getCashAccounts()
        ]);
        
        // Only get unpaid/partial/overdue invoices for payment
        const unpaid = invs.filter((i: any) => i.status !== 'paid');
        setInvoices(unpaid);
        
        if (accounts.success && accounts.accounts) {
          setCashAccounts(accounts.accounts);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data awal.');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  // Handle invoice status auto-selection logic
  useEffect(() => {
    if (txnType === 'Pembayaran Proyek' && invoiceId) {
      const selectedInv = invoices.find(i => i.id === invoiceId);
      if (selectedInv) {
        if (selectedInv.status === 'overdue') {
          setInvoiceStatus('overdue');
        } else if (selectedInv.status === 'pending') {
          setInvoiceStatus('partial'); // Default to partial when pending, user can override to paid later
        }
      }
    }
  }, [invoiceId, txnType, invoices]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accountId || !amount || !date) {
      setError('Harap lengkapi rekening, jumlah, dan tanggal.');
      return;
    }

    if (txnType === 'Pembayaran Proyek' && !invoiceId) {
      setError('Harap pilih invoice untuk pembayaran proyek ini.');
      return;
    }

    if (txnType !== 'Pembayaran Proyek' && !nameInput) {
      setError('Harap isi nama/detail transaksi.');
      return;
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

      const finalDescription = txnType === 'Pembayaran Proyek' 
        ? `Pembayaran Invoice ${invoices.find(i => i.id === invoiceId)?.number || ''} ${description ? '- ' + description : ''}`
        : `${nameInput} ${description ? '- ' + description : ''}`;

      const res = await createTransaction({
        accountId,
        type: 'expense', // Ignored on backend since logic recalculates it, but required by type signature
        category: txnType,
        amount: Number(amount),
        date: new Date(date),
        description: finalDescription,
        proofUrl: proofUrl || undefined,
        invoiceId: txnType === 'Pembayaran Proyek' ? invoiceId : undefined,
        invoiceStatus: txnType === 'Pembayaran Proyek' ? invoiceStatus : undefined,
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push('/transactions');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan pada sistem.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat data...</div>;

  const currentInvoice = invoices.find(i => i.id === invoiceId);
  const isOverdue = currentInvoice?.status === 'overdue';

  return (
    <>
      <Topbar title="Catat Transaksi" />
      <div className={styles.page}>
        <Link href="/transactions" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Transaksi Baru</h2>
          <p className={styles.formSubtitle}>Catat sewa, operasional, atau pembayaran proyek.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && (
              <div className="alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '16px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className="label">Tipe Transaksi</label>
                <select className="select" value={txnType} onChange={(e) => {
                  setTxnType(e.target.value);
                  setInvoiceId('');
                }}>
                  {transactionTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className="label">Rekening Sumber</label>
                <select className="select" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
                  <option value="">Pilih rekening...</option>
                  {cashAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>

              {txnType === 'Pembayaran Proyek' ? (
                <>
                  <div className={styles.field}>
                    <label className="label">Pilih Invoice</label>
                    <select className="select" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                      <option value="">Pilih invoice...</option>
                      {invoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.number} — {inv.projectName} ({new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(inv.amount)}) [Sisa: {new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(inv.amount - inv.paidAmount)}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className="label">Status Pembayaran</label>
                    <select 
                      className="select" 
                      value={invoiceStatus} 
                      onChange={(e) => setInvoiceStatus(e.target.value)}
                      disabled={isOverdue} // Disable if the invoice is overdue
                    >
                      <option value="partial">Partial</option>
                      <option value="paid">Paid</option>
                      {isOverdue && <option value="overdue">Overdue</option>}
                    </select>
                    {isOverdue && (
                      <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                        Invoice ini sudah overdue, status tidak dapat diubah ke partial atau paid secara langsung melalui form ini.
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className={styles.field}>
                  <label className="label">
                    {txnType === 'Sewa' ? 'Nama / Apa yang Disewa' : 'Nama / Apa yang Dibayar'}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={txnType === 'Sewa' ? 'Contoh: Sewa Kantor Lantai 3' : 'Contoh: Internet & Hosting'}
                  />
                </div>
              )}

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
              <label className="label">Keterangan Tambahan</label>
              <textarea className="input" rows={2} placeholder="Catatan transaksi..." style={{ resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className={styles.formActions}>
              <Link href="/transactions" className="btn btn-secondary">Batal</Link>
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
