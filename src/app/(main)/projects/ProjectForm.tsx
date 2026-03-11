'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { ProjectFormData } from '@/actions/projects';
import CurrencyInput from '@/components/CurrencyInput';
import styles from './new/page.module.css';

const PROJECT_STATUSES = [
  'Requirement/Planning',
  'Design',
  'Development',
  'Testing',
  'Deployment/Finished',
  'Canceled'
];

interface EmployeeOption {
  id: string;
  name: string;
  avatar: string;
  position: string;
  department: string;
}

interface ProjectFormProps {
  initialData?: any;
  employees: EmployeeOption[];
  onSubmit: (data: ProjectFormData) => Promise<{ success?: boolean; id?: string; error?: string }>;
}

export default function ProjectForm({ initialData, employees, onSubmit }: ProjectFormProps) {
  const [teamSearch, setTeamSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name || '',
    client: initialData?.client || '',
    budget: initialData?.budget || 0,
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    deadline: initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
    description: initialData?.description || '',
    teamIds: initialData?.teamIds || [],
    status: initialData?.status || 'Requirement/Planning',
    progress: initialData?.progress || 0,
  });

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
    emp.position.toLowerCase().includes(teamSearch.toLowerCase())
  );

  const handleToggleMember = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.teamIds.includes(id);
      return {
        ...prev,
        teamIds: isSelected 
          ? prev.teamIds.filter(t => t !== id)
          : [...prev.teamIds, id]
      };
    });
  };

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
      <Link href={isEdit ? `/projects/${initialData.id}` : "/projects"} className={styles.backLink}>
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className={`card ${styles.formCard}`}>
        <h2 className={styles.formTitle}>{isEdit ? 'Edit Proyek' : 'Buat Proyek Baru'}</h2>
        <p className={styles.formSubtitle}>{isEdit ? 'Update data proyek.' : 'Tentukan detail proyek dan pilih anggota tim.'}</p>

        {error && <div style={{ color: 'var(--status-danger)', marginBottom: '16px' }}>{error}</div>}

        {/* Change form grid to flex column for full width inputs */}
        <form className={styles.form} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Nama Proyek</label>
            <input 
              type="text" 
              className="input" 
              required
              placeholder="Nama proyek" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Klien</label>
            <input 
              type="text" 
              className="input" 
              required
              placeholder="Nama klien" 
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
            />
          </div>

          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Status</label>
            <select 
              className="select" 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              disabled={!isEdit} // Initial create should be Requirement/Planning
            >
              <option value="">Pilih status...</option>
              {PROJECT_STATUSES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Budget</label>
            <CurrencyInput 
              required
              value={formData.budget}
              onChange={(val) => setFormData({...formData, budget: val})}
            />
          </div>
          
          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Tanggal Mulai</label>
            <input 
              type="date" 
              required
              className="input" 
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            />
          </div>
          
          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Deadline</label>
            <input 
              type="date" 
              required
              className="input" 
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
            />
          </div>

          {isEdit && (
            <div className={styles.field} style={{ width: '100%' }}>
              <label className="label">Progress (%)</label>
              <input 
                type="number" 
                min={0} max={100}
                className="input" 
                value={formData.progress}
                onChange={(e) => setFormData({...formData, progress: Number(e.target.value)})}
              />
            </div>
          )}

          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Deskripsi</label>
            <textarea 
              className="input" 
              rows={3} 
              placeholder="Deskripsi singkat proyek..." 
              style={{ resize: 'vertical', minHeight: '80px' }} 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className={styles.field} style={{ width: '100%' }}>
            <label className="label">Anggota Tim</label>
            <div className={styles.teamSearchBox}>
              <Search size={14} className={styles.teamSearchIcon} />
              <input
                type="text"
                className={`input ${styles.teamSearchInput}`}
                placeholder="Cari karyawan..."
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
              />
            </div>
            <div className={styles.teamSelect}>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <label key={emp.id} className={styles.teamOption}>
                    <input 
                      type="checkbox" 
                      checked={formData.teamIds.includes(emp.id)}
                      onChange={() => handleToggleMember(emp.id)}
                    />
                    <span className={styles.teamAvatar}>{emp.avatar}</span>
                    <div className={styles.teamInfo}>
                      <span className={styles.teamName}>{emp.name}</span>
                      <span className={styles.teamRole}>{emp.position}</span>
                    </div>
                  </label>
                ))
              ) : (
                <p className={styles.emptySearch}>Tidak ada karyawan ditemukan.</p>
              )}
            </div>
          </div>

          <div className={styles.formActions} style={{ marginTop: '16px' }}>
            <Link href={isEdit ? `/projects/${initialData.id}` : "/projects"} className="btn btn-secondary">Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : (isEdit ? 'Update Proyek' : 'Buat Proyek')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
