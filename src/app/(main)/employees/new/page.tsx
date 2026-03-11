import { getDepartments, createEmployee } from '@/actions/employees';
import NewEmployeeClient from './NewEmployeeClient';

export default async function NewEmployeePage() {
  const departments = await getDepartments();

  return <NewEmployeeClient departments={departments} />;
}
