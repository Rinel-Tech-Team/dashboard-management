'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Pencil, Trash2, Calendar, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import ConfirmModal from '@/components/ConfirmModal';
import { formatCurrency, formatDate } from '@/lib/mockData';
import styles from './page.module.css';
import { deleteProject } from '@/actions/projects';

const PROJECT_STATUSES = [
  'Requirement/Planning',
  'Design',
  'Development',
  'Testing',
  'Deployment/Finished',
  'Canceled'
] as const;

interface ProjectsClientProps {
  initialData: any[];
}

export default function ProjectsClient({ initialData }: ProjectsClientProps) {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = initialData.filter((p) => {
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleOpenDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to detail if clicked on card
    e.stopPropagation();
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    
    try {
      const res = await deleteProject(deletingId);
      if (res?.error) {
        alert(res.error);
      } else {
        alert('Proyek berhasil dihapus');
        setIsConfirmOpen(false);
      }
    } catch (err) {
      alert('Gagal menghapus proyek');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Daftar Proyek"
        subtitle={`${initialData.length} proyek terdaftar`}
        actionLabel="Proyek Baru"
        actionHref="/projects/new"
      />

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Cari proyek atau klien..."
            className={`input ${styles.searchInput}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.statusFilters}>
          <button
            className={`${styles.filterBtn} ${!statusFilter ? styles.active : ''}`}
            onClick={() => setStatusFilter('')}
          >
            Semua
          </button>
          
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${statusFilter === s ? styles.active : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className={`${styles.grid} stagger-children`}>
        {filtered.map((project) => {
          const team = project.teamMembers;
          return (
            <div key={project.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <Link href={`/projects/${project.id}`} className={styles.cardTitleLink}>
                  <h3 className={styles.cardTitle}>{project.name}</h3>
                  <p className={styles.cardClient}>{project.client}</p>
                </Link>
                <div className={styles.cardHeaderRight}>
                  <StatusBadge label={project.status} />
                  <div className={styles.cardActions}>
                    <Link href={`/projects/${project.id}/edit`} className="btn btn-ghost btn-icon btn-sm" title="Edit">
                      <Pencil size={14} />
                    </Link>
                    <button 
                      className="btn btn-ghost btn-icon btn-sm" 
                      style={{ color: 'var(--status-danger)' }} 
                      title="Hapus"
                      onClick={(e) => handleOpenDelete(e, project.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <Link href={`/projects/${project.id}`} className={styles.cardBody}>
                <p className={styles.cardDesc}>{project.description || 'Tidak ada deskripsi'}</p>

                <div className={styles.cardBudget}>
                  <span className={styles.budgetLabel}>Budget</span>
                  <span className={styles.budgetValue}>
                    {project.budget > 0 ? formatCurrency(project.budget) : 'Internal'}
                  </span>
                </div>

                <ProgressBar
                  progress={project.progress}
                  color={
                    project.status === 'Canceled'
                      ? 'danger'
                      : project.status === 'Deployment/Finished' || project.progress >= 80
                      ? 'teal'
                      : 'indigo'
                  }
                />

                <div className={styles.cardFooter}>
                  <div className={styles.teamAvatars}>
                    {team.slice(0, 4).map((emp: any) => (
                      <div key={emp.id} className={styles.teamAvatar} title={emp.name}>
                        {emp.avatar || emp.name.charAt(0)}
                      </div>
                    ))}
                    {team.length > 4 && (
                      <div className={`${styles.teamAvatar} ${styles.teamMore}`}>
                        +{team.length - 4}
                      </div>
                    )}
                    {team.length === 0 && <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Belum ada tim</span>}
                  </div>
                  <div className={styles.deadline}>
                    <Calendar size={12} />
                    {formatDate(project.deadline)}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            Tidak ada data proyek yang ditemukan.
          </div>
        )}
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Hapus Proyek"
        message="Apakah Anda yakin ingin menghapus proyek ini? Semua data yang berelasi mungkin akan terpengaruh. Aksi ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        danger={true}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
