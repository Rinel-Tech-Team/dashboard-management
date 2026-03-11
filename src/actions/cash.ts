'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function createCashTransaction(data: {
  accountId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  description: string;
  proofUrl?: string;
}) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Get account
      const account = await tx.cashAccount.findUnique({ where: { id: data.accountId } });
      if (!account) throw new Error('Rekening tidak ditemukan.');

      // 2. Check balance if expense
      if (data.type === 'expense' && Number(account.balance) < data.amount) {
        throw new Error(`Saldo rekening tidak mencukupi. Saldo saat ini: Rp${Number(account.balance).toLocaleString('id-ID')}`);
      }

      // 3. Create transaction
      await tx.transaction.create({
        data: {
          id: `trx-${uuidv4().substring(0, 8)}`,
          accountId: data.accountId,
          type: data.type,
          category: data.category,
          amount: data.amount,
          date: data.date,
          description: data.description,
          proofUrl: data.proofUrl,
        }
      });

      // 4. Update balance
      const newBalance = data.type === 'income' 
        ? Number(account.balance) + data.amount 
        : Number(account.balance) - data.amount;

      await tx.cashAccount.update({
        where: { id: data.accountId },
        data: { balance: newBalance }
      });
    });

    revalidatePath('/cash');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating cash transaction:', error);
    return { error: error.message || 'Gagal mencatat transaksi kas.' };
  }
}

export async function deleteCashTransaction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({ where: { id } });
      if (!existing) throw new Error("Transaksi tidak ditemukan");

      // Revert account balance
      const account = await tx.cashAccount.findUnique({ where: { id: existing.accountId } });
      if (account) {
        const revertedBalance = existing.type === 'income'
          ? Number(account.balance) - Number(existing.amount)
          : Number(account.balance) + Number(existing.amount);

        await tx.cashAccount.update({
          where: { id: existing.accountId },
          data: { balance: revertedBalance }
        });
      }

      await tx.transaction.delete({ where: { id } });
    });

    revalidatePath('/cash');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting cash transaction:', error);
    return { error: error.message || 'Gagal menghapus transaksi kas.' };
  }
}

export async function getCashAccounts() {
  try {
    const rawAccounts = await prisma.cashAccount.findMany({
      orderBy: { name: 'asc' }
    });
    
    const accounts = rawAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      bank: acc.bank,
      balance: Number(acc.balance),
      icon: acc.icon,
      createdAt: acc.createdAt.toISOString(),
      updatedAt: acc.updatedAt.toISOString(),
    }));

    return { success: true, accounts };
  } catch (error) {
    console.error('Error fetching cash accounts:', error);
    return { error: 'Gagal mengambil data akun kas.' };
  }
}

export async function getTransactions() {
  try {
    const rawTransactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: { account: true }
    });
    
    const transactions = rawTransactions.map(trx => ({
      id: trx.id,
      accountId: trx.accountId,
      type: trx.type,
      category: trx.category,
      amount: Number(trx.amount),
      date: trx.date.toISOString(),
      description: trx.description,
      proofUrl: trx.proofUrl,
      createdAt: trx.createdAt.toISOString(),
      updatedAt: trx.updatedAt.toISOString(),
    }));

    return { success: true, transactions };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { error: 'Gagal mengambil data transaksi.' };
  }
}
