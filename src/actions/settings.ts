'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSetting.findUnique({
      where: { id: 'singleton' }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: { id: 'singleton', payrollDay: 25, currency: 'IDR' }
      });
    }

    return { 
      success: true, 
      settings: {
        ...settings,
        updatedAt: settings.updatedAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching settings:', error);
    return { error: 'Gagal mengambil pengaturan.' };
  }
}

export async function updateSystemSettings(data: { payrollDay: number; currency: string }) {
  try {
    await prisma.systemSetting.upsert({
      where: { id: 'singleton' },
      update: { payrollDay: data.payrollDay, currency: data.currency },
      create: { id: 'singleton', payrollDay: data.payrollDay, currency: data.currency }
    });

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating settings:', error);
    return { error: 'Gagal memperbarui pengaturan.' };
  }
}

export async function getAdminProfile(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });
    return { success: true, user };
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return { error: 'Gagal mengambil profil admin.' };
  }
}

export async function updateAdminProfile(id: string, data: { name: string; email: string }) {
  try {
    await prisma.user.update({
      where: { id },
      data: { name: data.name, email: data.email }
    });
    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Gagal memperbarui profil.' };
  }
}
