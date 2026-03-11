'use client';

import { useState, FormEvent, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Topbar from '@/components/Topbar';
import { uploadProofFile } from '@/actions/upload';
import { getTransactionById, updateTransaction } from '@/actions/transactions';
import { getInvoices } from '@/actions/invoices';
import { getCashAccounts } from '@/actions/cash';
import { transactionTypes } from '@/lib/mockData';
import styles from '../../new/page.module.css';

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
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
  const [existingProof, setExistingProof] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [invs, accounts, trxRes] = await Promise.all([
          getInvoices(),
          getCashAccounts(),
          getTransactionById(id)
        ]);
        
        // We probably want to allow editing against paid invoices if this transaction originated it
        setInvoices(invs);
        
        if (accounts.success && accounts.accounts) {
          setCashAccounts(accounts.accounts);
        }

        if (trxRes.success && trxRes.transaction) {
          const t = trxRes.transaction;
          setTxnType(t.category || 'Sewa');
          setAccountId(t.accountId);
          setAmount(t.amount.toString());
          setDate(new Date(t.date).toISOString().split('T')[0]);
          
          if (t.category === 'Pembayaran Proyek') {
             // Description format: Pembayaran Invoice INV-XXX - Additional Notes
             // Let's just put the raw description back to give context, though nameInput isn't used here.
             setDescription(t.description);
             if (t.invoiceId) {
               setInvoiceId(t.invoiceId);
               // the actual saved status on the invoice could be pulled from the invoice object itself
               const matchedInv = invs.find((i:any) => i.id === t.invoiceId);
               if (matchedInv) setInvoiceStatus(matchedInv.status);
             }
          } else {
             // Split string simply if it was auto-formatted, or just dump to nameInput if it's 1-on-1
             // Often it's easier to just put description into nameInput if we didn't store them separately
             const dashSplit = t.description.split(' - ');
             if (dashSplit.length > 1) {
                setNameInput(dashSplit[0]);
                setDescription(dashSplit.slice(1).join(' - '));
             } else {
                setNameInput(t.description);
                setDescription('');
             }
          }
          
          if (t.proofUrl) setExistingProof(t.proofUrl);
        } else {
          setError('Data transaksi tidak ditemukan.');
        }

      } catch (err) {
        console.error(err);
        setError('Gagal memuat data awal.');
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, [id]);

  // Handle invoice status auto-selection logic based on dropdown changes
  useEffect(() => {
    if (txnType === 'Pembayaran Proyek' && invoiceId && !fetching) {
      const selectedInv = invoices.find(i => i.id === invoiceId);
      if (selectedInv) {
        if (selectedInv.status === 'overdue') {
          setInvoiceStatus('overdue');
        } else if (selectedInv.status === 'pending') {
           // We ONLY force partial if we selected a brand new pending invoice. If it's the current one, we might want to keep the current state unless changed.
           // Since we are editing, we don't aggressively force it.
        }
      }
    }
  }, [invoiceId, txnType, invoices, fetching]);

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
      let finalProofUrl = existingProof || undefined;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await uploadProofFile(formData);
        
        if (uploadRes.error) {
          setError(uploadRes.error);
          setLoading(false);
          return;
        }
        finalProofUrl = uploadRes.url;
      }

      const finalDescription = txnType === 'Pembayaran Proyek' 
        ? `Pembayaran Invoice ${invoices.find(i => i.id === invoiceId)?.number || ''} ${description ? '- ' + description : ''}` // Fallback, could be better if not duplicating
        : `${nameInput} ${description ? '- ' + description : ''}`;

      const res = await updateTransaction(id, {
        accountId,
        type: 'expense', 
        category: txnType,
        amount: Number(amount),
        date: new Date(date),
        description: finalDescription,
        proofUrl: finalProofUrl,
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
      <Topbar title="Edit Transaksi" />
      <div className={styles.page}>
        <Link href="/transactions" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali
        </Link>

        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>Edit Transaksi</h2>
          <p className={styles.formSubtitle}>Ubah data transaksi sewa, operasional, atau proyek.</p>

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
                      {invoices.filter((inv) => inv.status !== 'paid' || inv.id === invoiceId).map((inv) => (
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
                <label className="label">Ganti Bukti Transfer (Opsional)</label>
                <input type="file" className="input" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                {existingProof && !file && (
                   <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                     Bukti sudah ada terunggah.
                   </span>
                )}
              </div>
            </div>

            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label className="label">Keterangan Tambahan</label>
              <textarea className="input" rows={2} placeholder="Catatan transaksi..." style={{ resize: 'vertical' }} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className={styles.formActions}>
              <Link href="/transactions" className="btn btn-secondary">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
