import Topbar from '@/components/Topbar';
import { getProjectById } from '@/actions/projects';
import ProjectDetailClient from './ProjectDetailClient';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectById(resolvedParams.id);
  
  if (!project) {
    return (
      <>
        <Topbar title="Proyek" />
        <div style={{ padding: '24px' }}>
          <p>Proyek tidak ditemukan.</p>
          <Link href="/projects" className="btn btn-secondary" style={{ marginTop: '16px' }}>Kembali</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Detail Proyek" />
      <ProjectDetailClient initialData={project} />
    </>
  );
}
