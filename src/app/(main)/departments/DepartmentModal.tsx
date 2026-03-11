'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './DepartmentModal.module.css';
import { DepartmentFormData } from '@/actions/departments';

interface DepartmentModalProps {
  open: boolean;
  department?: any;
  onClose: () => void;
  onSubmit: (data: DepartmentFormData) => Promise<{ error?: string; success?: boolean }>;
}

export default function DepartmentModal({
  open,
  department,
  onClose,
  onSubmit
}: DepartmentModalProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    head: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      if (department) {
        setFormData({
          name: department.name || '',
          description: department.description || '',
          head: department.head || '-',
        });
      } else {
        setFormData({ name: '', description: '', head: '' });
      }
      setError('');
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, department]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await onSubmit(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        onClose();
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga.');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!department;

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={(e) => {
      if (e.target === overlayRef.current) onClose();
    }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>{isEdit ? 'Edit Departemen' : 'Tambah Departemen'}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nama Departemen</label>
            <input
              type="text"
              required
              className={`input ${styles.input}`}
              placeholder="Ex: IT & Engineering"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Kepala Departemen (Opsional)</label>
            <input
              type="text"
              className={`input ${styles.input}`}
              placeholder="Ex: John Doe"
              value={formData.head}
              onChange={e => setFormData({ ...formData, head: e.target.value })}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Deskripsi (Opsional)</label>
            <textarea
              className={`input ${styles.textarea}`}
              placeholder="Tugas dan fungsi departemen..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
