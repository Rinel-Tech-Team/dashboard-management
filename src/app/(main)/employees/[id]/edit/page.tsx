import { notFound } from 'next/navigation';
import { getEmployeeById, getDepartments } from '@/actions/employees';
import EditEmployeeClient from './EditEmployeeClient';

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [employee, departments] = await Promise.all([
    getEmployeeById(id),
    getDepartments(),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <EditEmployeeClient
      employee={employee}
      departments={departments}
    />
  );
}
