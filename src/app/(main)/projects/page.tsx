import Topbar from '@/components/Topbar';
import { getProjects } from '@/actions/projects';
import ProjectsClient from './ProjectsClient';

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <Topbar title="Proyek" subtitle="Kelola semua proyek perusahaan" />
      <ProjectsClient initialData={projects} />
    </>
  );
}
