'use client';

import { useRouter } from 'next/navigation';
import ProjectForm from '../ProjectForm';
import { createProject, ProjectFormData } from '@/actions/projects';

interface ProjectFormWrapperProps {
  employees: any[];
}

export default function ProjectFormWrapper({ employees }: ProjectFormWrapperProps) {
  const router = useRouter();

  const handleSubmit = async (data: ProjectFormData) => {
    const res = await createProject(data);
    if (!res?.error) {
      router.push(`/projects/${res.id}`);
      return {};
    }
    return res;
  };

  return <ProjectForm employees={employees} onSubmit={handleSubmit} />;
}
