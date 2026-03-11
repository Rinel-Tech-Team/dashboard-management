'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, Eye, Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ConfirmModal from '@/components/ConfirmModal';
import { deleteEmployee } from '@/actions/employees';
import styles from './page.module.css';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  position: string;
  status: string;
  department: string;
  departmentId: string;
  joinDate: string;
  salary: number;
  allowance: number;
}

interface Department {
  id: string;
  name: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default function EmployeesTable({
  employees,
  departments,
}: {
  employees: Employee[];
  departments: Department[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const filtered = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || emp.departmentId === deptFilter;
    const matchStatus = !statusFilter || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');

    const result = await deleteEmployee(deleteTarget.id);
    if (result.error) {
      setDeleteError(result.error);
      setDeleting(false);
    } else {
      setDeleteTarget(null);
      setDeleting(false);
      router.refresh();
    }
  };

  return (
    <>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className={`input ${styles.searchInput}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <Filter size={16} />
          <select
            className="select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Non-Aktif</option>
            <option value="cuti">Cuti</option>
            <option value="resign">Resign</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Jabatan</th>
              <th>Departemen</th>
              <th>Status</th>
              <th>Gaji Pokok</th>
              <th>Tanggal Masuk</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
                  {search || deptFilter || statusFilter
                    ? 'Tidak ada karyawan yang cocok dengan filter.'
                    : 'Belum ada data karyawan. Klik "Tambah Karyawan" untuk memulai.'}
                </td>
              </tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className={styles.empInfo}>
                      <div className={styles.empAvatar}>{emp.avatar}</div>
                      <div>
                        <span className={styles.empName}>{emp.name}</span>
                        <span className={styles.empEmail}>{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{emp.position}</td>
                  <td>{emp.department}</td>
                  <td><StatusBadge label={emp.status} /></td>
                  <td className={styles.mono}>{formatCurrency(emp.salary)}</td>
                  <td>{formatDate(emp.joinDate)}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/employees/${emp.id}`} className="btn btn-ghost btn-icon btn-sm" title="Lihat">
                        <Eye size={15} />
                      </Link>
                      <Link href={`/employees/${emp.id}/edit`} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--status-danger)' }}
                        title="Hapus"
                        onClick={() => { setDeleteTarget(emp); setDeleteError(''); }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Menampilkan {filtered.length} dari {employees.length} karyawan
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Karyawan?"
        message={
          deleteError
            ? deleteError
            : `Apakah Anda yakin ingin menghapus karyawan "${deleteTarget?.name}"? Data yang dihapus tidak bisa dikembalikan.`
        }
        confirmLabel="Hapus"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
        loading={deleting}
        danger
      />
    </>
  );
}
