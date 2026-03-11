import Topbar from '@/components/Topbar';
import { getProjectById } from '@/actions/projects';
import { getEmployees } from '@/actions/employees';
import EditProjectWrapper from './EditProjectWrapper';
import { notFound } from 'next/navigation';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectById(resolvedParams.id);
  
  if (!project) {
    notFound();
  }

  const employees = await getEmployees();
  
  const employeeOptions = employees.map(e => ({
    id: e.id,
    name: e.name,
    avatar: e.avatar,
    position: e.position,
    department: e.department
  }));

  return (
    <>
      <Topbar title="Edit Proyek" />
      <EditProjectWrapper initialData={project} employees={employeeOptions} />
    </>
  );
}
