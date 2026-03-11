import Topbar from '@/components/Topbar';
import { getDepartments } from '@/actions/departments';
import DepartmentsClient from './DepartmentsClient';

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <>
      <Topbar title="Departemen" subtitle="Kelola struktur departemen perusahaan" />
      <DepartmentsClient initialData={departments} />
    </>
  );
}
