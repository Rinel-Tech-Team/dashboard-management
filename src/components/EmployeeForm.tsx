'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import CurrencyInput from '@/components/CurrencyInput';
import styles from './EmployeeForm.module.css';

interface Department {
  id: string;
  name: string;
}

export interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  position: string;
  departmentId: string;
  joinDate: string;
  salary: number;
  allowance: number;
  status: string;
}

interface EmployeeFormProps {
  title: string;
  topbarTitle: string;
  departments: Department[];
  initialValues?: EmployeeFormValues;
  onSubmit: (values: EmployeeFormValues) => Promise<{ error?: string } | void>;
  submitLabel: string;
}

const defaultValues: EmployeeFormValues = {
  name: '',
  email: '',
  phone: '',
  position: '',
  departmentId: '',
  joinDate: new Date().toISOString().split('T')[0],
  salary: 0,
  allowance: 0,
  status: 'active',
};

export default function EmployeeForm({
  title,
  topbarTitle,
  departments,
  initialValues,
  onSubmit,
  submitLabel,
}: EmployeeFormProps) {
  const [values, setValues] = useState<EmployeeFormValues>(initialValues || defaultValues);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof EmployeeFormValues, value: string | number) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!values.name.trim()) { setError('Nama lengkap wajib diisi.'); return; }
    if (!values.email.trim()) { setError('Email wajib diisi.'); return; }
    if (!values.position.trim()) { setError('Jabatan wajib diisi.'); return; }
    if (!values.departmentId) { setError('Departemen wajib dipilih.'); return; }
    if (!values.joinDate) { setError('Tanggal masuk wajib diisi.'); return; }
    if (values.salary <= 0) { setError('Gaji pokok harus lebih dari 0.'); return; }

    setLoading(true);
    try {
      const result = await onSubmit(values);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      if (err.message === 'NEXT_REDIRECT') {
        // redirect from server action
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Topbar title={topbarTitle} />
      <div className={styles.page}>
        <Link href="/employees" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali ke daftar
        </Link>

        <div className={`card ${styles.formCard}`}>
          <h2 className={styles.formTitle}>{title}</h2>
          <p className={styles.formSubtitle}>
            {initialValues ? 'Perbarui data karyawan di bawah ini.' : 'Isi form berikut untuk menambahkan karyawan baru.'}
          </p>

          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-name">Nama Lengkap <span className={styles.required}>*</span></label>
                <input
                  id="emp-name"
                  type="text"
                  className="input"
                  placeholder="Masukkan nama lengkap"
                  value={values.name}
                  onChange={e => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-email">Email <span className={styles.required}>*</span></label>
                <input
                  id="emp-email"
                  type="email"
                  className="input"
                  placeholder="email@rinel.id"
                  value={values.email}
                  onChange={e => handleChange('email', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-phone">No. Telepon</label>
                <input
                  id="emp-phone"
                  type="tel"
                  className="input"
                  placeholder="0812-xxxx-xxxx"
                  value={values.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-position">Jabatan <span className={styles.required}>*</span></label>
                <input
                  id="emp-position"
                  type="text"
                  className="input"
                  placeholder="Contoh: Frontend Developer"
                  value={values.position}
                  onChange={e => handleChange('position', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-dept">Departemen <span className={styles.required}>*</span></label>
                <select
                  id="emp-dept"
                  className="select"
                  value={values.departmentId}
                  onChange={e => handleChange('departmentId', e.target.value)}
                  required
                >
                  <option value="">Pilih departemen</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-status">Status</label>
                <select
                  id="emp-status"
                  className="select"
                  value={values.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Non-Aktif</option>
                  <option value="cuti">Cuti</option>
                  <option value="resign">Resign</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-join">Tanggal Masuk <span className={styles.required}>*</span></label>
                <input
                  id="emp-join"
                  type="date"
                  className="input"
                  value={values.joinDate}
                  onChange={e => handleChange('joinDate', e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>{/* spacer for grid alignment */}</div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-salary">Gaji Pokok <span className={styles.required}>*</span></label>
                <CurrencyInput
                  id="emp-salary"
                  value={values.salary}
                  onChange={v => handleChange('salary', v)}
                  placeholder="10.000.000"
                  required
                />
              </div>
              <div className={styles.field}>
                <label className="label" htmlFor="emp-allowance">Tunjangan <span className={styles.optional}>(opsional)</span></label>
                <CurrencyInput
                  id="emp-allowance"
                  value={values.allowance}
                  onChange={v => handleChange('allowance', v)}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Summary */}
            {(values.salary > 0) && (
              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Gaji Pokok</span>
                  <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(values.salary)}</span>
                </div>
                {values.allowance > 0 && (
                  <div className={styles.summaryRow}>
                    <span>Tunjangan</span>
                    <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(values.allowance)}</span>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total Kompensasi / Bulan</span>
                  <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(values.salary + values.allowance)}</span>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <Link href="/employees" className="btn btn-secondary">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading && <Loader2 size={16} className={styles.spinner} />}
                {loading ? 'Menyimpan...' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
