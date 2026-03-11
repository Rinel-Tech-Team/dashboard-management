import Topbar from '@/components/Topbar';
import { getEmployees } from '@/actions/employees';
import ProjectFormWrapper from './ProjectFormWrapper';

export default async function NewProjectPage() {
  const employees = await getEmployees();
  
  // Transform to EmployeeOption type
  const employeeOptions = employees.map(e => ({
    id: e.id,
    name: e.name,
    avatar: e.avatar,
    position: e.position,
    department: e.department
  }));

  return (
    <>
      <Topbar title="Proyek Baru" />
      <ProjectFormWrapper employees={employeeOptions} />
    </>
  );
}
