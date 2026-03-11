'use client';

import { useRouter } from 'next/navigation';
import ProjectForm from '../../ProjectForm';
import { updateProject, ProjectFormData } from '@/actions/projects';

interface EditProjectWrapperProps {
  initialData: any;
  employees: any[];
}

export default function EditProjectWrapper({ initialData, employees }: EditProjectWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (data: ProjectFormData) => {
    const res = await updateProject(initialData.id, data);
    if (!res?.error) {
      router.push(`/projects/${initialData.id}`);
      return {};
    }
    return res;
  };

  return <ProjectForm initialData={initialData} employees={employees} onSubmit={handleSubmit} />;
}
