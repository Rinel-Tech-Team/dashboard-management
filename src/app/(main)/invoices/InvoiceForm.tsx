'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { InvoiceFormData } from '@/actions/invoices';
import CurrencyInput from '@/components/CurrencyInput';
import styles from './new/page.module.css';

interface ProjectOption {
  id: string;
  name: string;
  client: string;
}

interface InvoiceFormProps {
  initialData?: any;
  projects: ProjectOption[];
  onSubmit: (data: InvoiceFormData) => Promise<{ success?: boolean; id?: string; error?: string }>;
}

export default function InvoiceForm({ initialData, projects, onSubmit }: InvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<InvoiceFormData>({
    projectId: initialData?.projectId || '',
    amount: initialData?.amount || 0,
    issuedDate: initialData?.issuedDate ? new Date(initialData.issuedDate).toISOString().split('T')[0] : '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    description: initialData?.description || '',
    number: initialData?.number || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await onSubmit(formData);
      if (res.error) {
        setError(res.error);
      }
    } catch (err) {
      setError('Terjadi kesalahan tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData;

  return (
    <div className={styles.page}>
      <Link href="/invoices" className={styles.backLink}>
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className={`card ${styles.formCard}`}>
        <h2 className={styles.formTitle}>{isEdit ? 'Edit Invoice' : 'Generate Invoice Baru'}</h2>
        <p className={styles.formSubtitle}>{isEdit ? 'Update data invoice.' : 'Pilih proyek, lalu tentukan jumlah dan detail invoice.'}</p>

        {error && <div style={{ color: 'var(--status-danger)', marginBottom: '16px' }}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Proyek</label>
            <select 
              className="select" 
              required
              value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})}
            >
              <option value="">Pilih proyek...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.client}</option>
              ))}
            </select>
          </div>

          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Jumlah Invoice</label>
            <CurrencyInput 
              required
              value={formData.amount}
              onChange={(val) => setFormData({...formData, amount: val})}
            />
          </div>
          
          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Tanggal Invoice</label>
            <input 
              type="date" 
              required
              className="input" 
              value={formData.issuedDate}
              onChange={(e) => setFormData({...formData, issuedDate: e.target.value})}
            />
          </div>
          
          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Jatuh Tempo</label>
            <input 
              type="date" 
              required
              className="input" 
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </div>

          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Deskripsi</label>
            <textarea 
              className="input" 
              rows={3} 
              placeholder="Deskripsi invoice..." 
              style={{ resize: 'vertical', minHeight: '80px' }} 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className={styles.formActions} style={{ marginTop: '16px' }}>
            <Link href="/invoices" className="btn btn-secondary">Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : (isEdit ? 'Update Invoice' : 'Generate Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
