import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Briefcase, DollarSign, Pencil } from 'lucide-react';
import Topbar from '@/components/Topbar';
import StatusBadge from '@/components/StatusBadge';
import ProgressBar from '@/components/ProgressBar';
import { getEmployeeById } from '@/actions/employees';
import styles from './page.module.css';

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
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const emp = await getEmployeeById(id);

  if (!emp) {
    notFound();
  }

  return (
    <>
      <Topbar title="Detail Karyawan" />
      <div className={styles.page}>
        <Link href="/employees" className={styles.backLink}>
          <ArrowLeft size={16} /> Kembali ke daftar
        </Link>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>{emp.avatar}</div>
          <div className={styles.profileInfo}>
            <h2 className={styles.profileName}>{emp.name}</h2>
            <p className={styles.profilePosition}>{emp.position}</p>
            <StatusBadge label={emp.status} />
          </div>
          <div className={styles.profileActions}>
            <Link href={`/employees/${emp.id}/edit`} className="btn btn-primary btn-sm">
              <Pencil size={14} /> Edit Karyawan
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div className={styles.detailsGrid}>
          <div className={`card ${styles.detailCard}`}>
            <h3 className={styles.sectionTitle}>Informasi Pribadi</h3>
            <div className={styles.detailList}>
              <div className={styles.detailItem}>
                <Mail size={16} />
                <div>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{emp.email}</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <Phone size={16} />
                <div>
                  <span className={styles.detailLabel}>Telepon</span>
                  <span className={styles.detailValue}>{emp.phone || '-'}</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <Building2 size={16} />
                <div>
                  <span className={styles.detailLabel}>Departemen</span>
                  <span className={styles.detailValue}>{emp.department}</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <Calendar size={16} />
                <div>
                  <span className={styles.detailLabel}>Tanggal Masuk</span>
                  <span className={styles.detailValue}>{formatDate(emp.joinDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`card ${styles.detailCard}`}>
            <h3 className={styles.sectionTitle}>Kompensasi</h3>
            <div className={styles.detailList}>
              <div className={styles.detailItem}>
                <DollarSign size={16} />
                <div>
                  <span className={styles.detailLabel}>Gaji Pokok</span>
                  <span className={styles.detailValue}>{formatCurrency(emp.salary)}</span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <Briefcase size={16} />
                <div>
                  <span className={styles.detailLabel}>Tunjangan</span>
                  <span className={styles.detailValue}>
                    {emp.allowance > 0 ? formatCurrency(emp.allowance) : '-'}
                  </span>
                </div>
              </div>
              <div className={styles.detailItem}>
                <DollarSign size={16} />
                <div>
                  <span className={styles.detailLabel}>Total Bulanan</span>
                  <span className={styles.detailValueHighlight}>
                    {formatCurrency(emp.salary + emp.allowance)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className={`card ${styles.projectsSection}`}>
          <h3 className={styles.sectionTitle}>Proyek yang Terlibat ({emp.projects.length})</h3>
          {emp.projects.length > 0 ? (
            <div className={styles.projectList}>
              {emp.projects.map((p) => (
                <Link href={`/projects/${p.id}`} key={p.id} className={styles.projectRow}>
                  <span className={styles.projectName}>{p.name}</span>
                  <span className={styles.projectClient}>{p.client}</span>
                  <StatusBadge label={p.status} />
                  <div style={{ minWidth: 80 }}>
                    <ProgressBar progress={p.progress} size="sm" showLabel={false} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.emptyText}>Belum terlibat dalam proyek.</p>
          )}
        </div>
      </div>
    </>
  );
}
