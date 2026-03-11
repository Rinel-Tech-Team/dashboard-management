'use server';

import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  const supabase = await createClient();

  // Try signing in
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Sync user/role record in the background (non-blocking)
  // This doesn't need to finish before the user sees the dashboard
  const authUser = data.user;
  if (authUser) {
    prisma.user.findUnique({ where: { id: authUser.id } }).then(async (userRecord) => {
      if (!userRecord) {
        try {
          let adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
          if (!adminRole) {
            adminRole = await prisma.role.create({ data: { name: 'admin', description: 'Administrator' } });
          }
          await prisma.user.create({
            data: {
              id: authUser.id,
              email: authUser.email!,
              name: 'Administrator',
              roleId: adminRole.id,
            }
          });
        } catch (e) {
          console.error('Background user sync failed:', e);
        }
      }
    });
  }

  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/login');
  redirect('/login');
}
