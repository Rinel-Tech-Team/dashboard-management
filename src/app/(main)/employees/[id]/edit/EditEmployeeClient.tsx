'use client';

import EmployeeForm, { type EmployeeFormValues } from '@/components/EmployeeForm';
import { updateEmployee } from '@/actions/employees';

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  departmentId: string;
  joinDate: string;
  salary: number;
  allowance: number;
  status: string;
}

interface Props {
  employee: EmployeeData;
  departments: { id: string; name: string }[];
}

export default function EditEmployeeClient({ employee, departments }: Props) {
  const initialValues: EmployeeFormValues = {
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    position: employee.position,
    departmentId: employee.departmentId,
    joinDate: employee.joinDate.split('T')[0],
    salary: employee.salary,
    allowance: employee.allowance,
    status: employee.status,
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    const result = await updateEmployee(employee.id, {
      name: values.name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      departmentId: values.departmentId,
      joinDate: values.joinDate,
      salary: values.salary,
      allowance: values.allowance || undefined,
      status: values.status,
    });
    return result;
  };

  return (
    <EmployeeForm
      topbarTitle="Edit Karyawan"
      title={`Edit: ${employee.name}`}
      departments={departments}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="Simpan Perubahan"
    />
  );
}
