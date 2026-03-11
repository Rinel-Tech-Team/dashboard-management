'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import ConfirmModal from '@/components/ConfirmModal';
import { updateProjectStatusProgress, deleteProject } from '@/actions/projects';
import { formatCurrency, formatDate } from '@/lib/mockData';
import styles from './page.module.css';

const milestones = [
  { key: 'requirement', label: 'Requirement', range: [0, 10], desc: 'Pengumpulan kebutuhan & scope proyek' },
  { key: 'design', label: 'Design', range: [11, 25], desc: 'Perancangan UI/UX & arsitektur sistem' },
  { key: 'development', label: 'Development', range: [26, 65], desc: 'Pengembangan fitur & coding' },
  { key: 'testing', label: 'Testing', range: [66, 85], desc: 'QA, bug fixing, & UAT' },
  { key: 'deployment', label: 'Deployment', range: [86, 95], desc: 'Deployment ke production & staging' },
  { key: 'handover', label: 'Handover', range: [96, 100], desc: 'Serah terima & dokumentasi final' },
];

function getMilestoneIndex(progress: number): number {
  for (let i = 0; i < milestones.length; i++) {
    if (progress <= milestones[i].range[1]) return i;
  }
  return milestones.length - 1;
}

export default function ProjectDetailClient({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [project, setProject] = useState(initialData);
  const [progress, setProgress] = useState(project.progress);
  const [updating, setUpdating] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const team = project.teamMembers;
  const projectInvoices = project.invoices || [];
  const totalPaid = projectInvoices.reduce((sum: number, inv: any) => sum + inv.paidAmount, 0);
  const currentMilestoneIdx = getMilestoneIndex(progress);

  const handleUpdateProgress = async (newProgress: number) => {
    setProgress(newProgress);
    setUpdating(true);
    try {
      // Determine automatic status based on progress milestone if desirable,
      // or just keep status as is. Here we will keep status as is unless it reaches 100.
      let newStatus = project.status;
      if (newProgress === 100 && newStatus !== 'Deployment/Finished') {
        newStatus = 'Deployment/Finished';
      }
      
      const res = await updateProjectStatusProgress(project.id, newStatus, newProgress);
      if (res?.success) {
        setProject({ ...project, progress: newProgress, status: newStatus });
      } else {
        alert(res.error || 'Gagal update progress');
        setProgress(project.progress); // revert
      }
    } catch (e) {
      alert('Gagal update progress');
      setProgress(project.progress); // revert
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProject(project.id);
      if (res?.success) {
        router.push('/projects');
      } else {
        alert(res.error || 'Gagal menghapus proyek');
        setIsConfirmOpen(false);
      }
    } catch (e) {
      alert('Gagal menghapus proyek');
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <Link href="/projects" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali ke daftar
        </Link>
        <div className={styles.topActions}>
          <Link href={`/projects/${project.id}/edit`} className="btn btn-secondary btn-sm">
            <Pencil size={14} /> Edit Proyek
          </Link>
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ color: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}
            onClick={() => setIsConfirmOpen(true)}
          >
            <Trash2 size={14} /> Hapus
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInfo}>
          <h2 className={styles.heroTitle}>{project.name}</h2>
          <p className={styles.heroClient}>{project.client}</p>
          <p className={styles.heroDesc}>{project.description || 'Tidak ada deskripsi'}</p>
        </div>
        <StatusBadge label={project.status} />
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={`card ${styles.stat}`}>
          <DollarSign size={18} className={styles.statIcon} />
          <div>
            <span className={styles.statLabel}>Budget</span>
            <span className={styles.statValue}>
              {project.budget > 0 ? formatCurrency(project.budget) : 'Internal'}
            </span>
          </div>
        </div>
        <div className={`card ${styles.stat}`}>
          <DollarSign size={18} className={styles.statIcon} />
          <div>
            <span className={styles.statLabel}>Terbayar</span>
            <span className={styles.statValue}>{formatCurrency(totalPaid)}</span>
          </div>
        </div>
        <div className={`card ${styles.stat}`}>
          <Calendar size={18} className={styles.statIcon} />
          <div>
            <span className={styles.statLabel}>Deadline</span>
            <span className={styles.statValue}>{formatDate(project.deadline)}</span>
          </div>
        </div>
        <div className={`card ${styles.stat}`}>
          <Users size={18} className={styles.statIcon} />
          <div>
            <span className={styles.statLabel}>Tim</span>
            <span className={styles.statValue}>{team.length} orang</span>
          </div>
        </div>
      </div>

      {/* ===== PROGRESS FLOW ===== */}
      <div className={`card ${styles.progressSection}`}>
        <div className={styles.progressHeader}>
          <h3 className={styles.sectionTitle}>Progress Proyek</h3>
          <span className={styles.progressPercent}>{progress}%</span>
        </div>

        <ProgressBar
          progress={progress}
          color={progress >= 80 ? 'teal' : 'indigo'}
        />

        {/* Milestone Stepper */}
        <div className={styles.milestones}>
          {milestones.map((ms, idx) => {
            const isCompleted = idx < currentMilestoneIdx;
            const isCurrent = idx === currentMilestoneIdx;
            return (
              <div
                key={ms.key}
                className={`${styles.milestone} ${isCompleted ? styles.msCompleted : ''} ${isCurrent ? styles.msCurrent : ''}`}
              >
                <div className={styles.msIconWrap}>
                  {isCompleted ? (
                    <CheckCircle2 size={20} className={styles.msIconDone} />
                  ) : isCurrent ? (
                    <div className={styles.msIconActive}>
                      <ChevronRight size={14} />
                    </div>
                  ) : (
                    <Circle size={20} className={styles.msIconPending} />
                  )}
                  {idx < milestones.length - 1 && (
                    <div className={`${styles.msLine} ${isCompleted ? styles.msLineDone : ''}`} />
                  )}
                </div>
                <div className={styles.msContent}>
                  <span className={styles.msLabel}>{ms.label}</span>
                  <span className={styles.msRange}>{ms.range[0]}% – {ms.range[1]}%</span>
                  <span className={styles.msDesc}>{ms.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Controls */}
        <div className={styles.progressControls}>
          <span className={styles.controlLabel}>Update Progress:</span>
          <div className={styles.controlBtns}>
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={() => handleUpdateProgress(Math.max(0, progress - 5))}
              disabled={progress <= 0 || updating}
            >
              <Minus size={14} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              onMouseUp={(e) => handleUpdateProgress(Number((e.target as HTMLInputElement).value))}
              className={styles.slider}
              disabled={updating}
            />
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={() => handleUpdateProgress(Math.min(100, progress + 5))}
              disabled={progress >= 100 || updating}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className={styles.presetBtns}>
            {[0, 25, 50, 75, 100].map((val) => (
              <button
                key={val}
                className={`${styles.presetBtn} ${progress === val ? styles.presetActive : ''}`}
                onClick={() => handleUpdateProgress(val)}
                disabled={updating}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        <div className={styles.timeline}>
          <span>Mulai: {formatDate(project.startDate)}</span>
          <span>Deadline: {formatDate(project.deadline)}</span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomGrid}>
        {/* Team */}
        <div className={`card ${styles.teamCard}`}>
          <h3 className={styles.sectionTitle}>Anggota Tim ({team.length})</h3>
          <div className={styles.teamList}>
            {team.map((emp: any) => (
              <div key={emp.id} className={styles.teamMember}>
                <div className={styles.tmAvatar}>{emp.avatar || emp.name.charAt(0)}</div>
                <div>
                  <span className={styles.tmName}>{emp.name}</span>
                  <span className={styles.tmRole}>{emp.position}</span>
                </div>
              </div>
            ))}
            {team.length === 0 && <p style={{color: 'var(--text-muted)'}}>Belum ada anggota tim.</p>}
          </div>
        </div>

        {/* Invoices */}
        <div className={`card ${styles.invoicesCard}`}>
          <h3 className={styles.sectionTitle}>Invoice Terkait ({projectInvoices.length})</h3>
          {projectInvoices.length > 0 ? (
            <div className={styles.invoiceList}>
              {projectInvoices.map((inv: any) => (
                <div key={inv.id} className={styles.invoiceRow}>
                  <span className={styles.invNumber}>{inv.number}</span>
                  <span className={styles.invAmount}>{formatCurrency(inv.amount)}</span>
                  <StatusBadge label={inv.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Belum ada invoice untuk proyek ini.</p>
          )}
        </div>
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Hapus Proyek"
        message="Apakah Anda yakin ingin menghapus proyek ini? Semua data yang berelasi mungkin akan terpengaruh. Aksi ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        danger={true}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
