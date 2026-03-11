'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ConfirmModal from '@/components/ConfirmModal';
import styles from './page.module.css';
import DepartmentModal from './DepartmentModal';
import { createDepartment, updateDepartment, deleteDepartment, DepartmentFormData } from '@/actions/departments';

interface DepartmentsClientProps {
  initialData: any[];
}

export default function DepartmentsClient({ initialData }: DepartmentsClientProps) {
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any | null>(null);
  
  // Delete confirm states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local state when initialData changes, but Next.js will re-render anyway
  // For simplicity, we just filter the initialData for search
  
  const filtered = initialData.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleSubmit = async (data: DepartmentFormData) => {
    let res;
    if (editingDept) {
      res = await updateDepartment(editingDept.id, data);
    } else {
      res = await createDepartment(data);
    }

    if (res?.success) {
      alert(editingDept ? 'Departemen berhasil diupdate' : 'Departemen berhasil ditambahkan');
    }

    return res;
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    
    try {
      const res = await deleteDepartment(deletingId);
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Departemen berhasil dihapus');
        setIsConfirmOpen(false);
      }
    } catch (err) {
      alert('Gagal menghapus departemen');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Daftar Departemen"
        subtitle={`${initialData.length} departemen terdaftar`}
        actionLabel="Tambah Departemen"
        onAction={handleOpenAdd}
      />

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari departemen..."
            className={`input ${styles.searchInput}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className={`${styles.grid} stagger-children`}>
        {filtered.map((dept) => (
          <div key={dept.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>{dept.name}</h3>
              <div className={styles.cardActions}>
                <button 
                  className="btn btn-ghost btn-icon btn-sm" 
                  title="Edit"
                  onClick={() => handleOpenEdit(dept)}
                >
                  <Edit2 size={15} />
                </button>
                <button 
                  className="btn btn-ghost btn-icon btn-sm" 
                  style={{ color: 'var(--status-danger)' }} 
                  title="Hapus"
                  onClick={() => handleOpenDelete(dept.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <p className={styles.cardDesc}>{dept.description || 'Tidak ada deskripsi'}</p>

            <div className={styles.cardFooter}>
              <div className={styles.headInfo}>
                <span className={styles.label}>Kepala:</span>
                <span className={styles.value}>{dept.head}</span>
              </div>
              <div className={styles.headcount}>
                <Users size={14} />
                <span>{dept.employeeCount || 0} Karyawan</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Tidak ada data departemen yang ditemukan.
          </div>
        )}
      </div>

      {/* Modals */}
      <DepartmentModal
        open={isModalOpen}
        department={editingDept}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={isConfirmOpen}
        title="Hapus Departemen"
        message="Apakah Anda yakin ingin menghapus departemen ini? Data tidak bisa dihapus jika masih ada karyawan di departemen tersebut."
        confirmLabel="Hapus"
        danger={true}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
