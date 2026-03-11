'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

// GET all transactions with relations
export async function getTransactions() {
  try {
    const data = await prisma.transaction.findMany({
      include: {
        account: true,
        invoice: {
          include: { project: true }
        },
      },
      orderBy: { date: 'desc' },
      where: {
        category: {
          in: ['Sewa', 'Operasional', 'Pembayaran Proyek']
        }
      }
    });

    const transactions = data.map(trx => ({
      id: trx.id,
      date: trx.date.toISOString(),
      description: trx.description,
      category: trx.category,
      type: trx.type,
      amount: Number(trx.amount),
      proofUrl: trx.proofUrl,
      createdAt: trx.createdAt.toISOString(),
      updatedAt: trx.updatedAt.toISOString(),
      accountId: trx.accountId,
      invoiceId: trx.invoiceId,
      account: trx.account ? {
        id: trx.account.id,
        name: trx.account.name,
        bank: trx.account.bank,
        balance: Number(trx.account.balance),
        icon: trx.account.icon,
      } : null,
      invoice: trx.invoice ? {
        id: trx.invoice.id,
        number: trx.invoice.number,
        projectName: trx.invoice.project.name,
        amount: Number(trx.invoice.amount),
        status: trx.invoice.status,
      } : null,
    }));

    return { success: true, transactions };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { error: 'Gagal mengambil data transaksi' };
  }
}

// GET single transaction
export async function getTransactionById(id: string) {
  try {
    const data = await prisma.transaction.findUnique({
      where: { id },
      include: {
        account: true,
        invoice: {
          include: { project: true }
        },
      }
    });

    if (!data) return { error: 'Transaksi tidak ditemukan' };

    const transaction = {
      id: data.id,
      date: data.date.toISOString(),
      description: data.description,
      category: data.category,
      type: data.type,
      amount: Number(data.amount),
      proofUrl: data.proofUrl,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      accountId: data.accountId,
      invoiceId: data.invoiceId,
      account: data.account ? {
        id: data.account.id,
        name: data.account.name,
        bank: data.account.bank,
        balance: Number(data.account.balance),
        icon: data.account.icon,
      } : null,
      invoice: data.invoice ? {
        id: data.invoice.id,
        number: data.invoice.number,
        projectName: data.invoice.project.name,
        amount: Number(data.invoice.amount),
        paidAmount: Number(data.invoice.paidAmount),
        status: data.invoice.status,
      } : null,
    };

    return { success: true, transaction };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return { error: 'Gagal mengambil data transaksi' };
  }
}

// CREATE transaction
export async function createTransaction(data: {
  accountId: string;
  type: string; // "Sewa", "Operasional", "Pembayaran Proyek", dll.
  category: string;
  amount: number;
  date: Date;
  description: string;
  proofUrl?: string;
  invoiceId?: string;
  invoiceStatus?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Determine cash flow direction. Pembayaran Proyek = Income (uang masuk), sisanya Expense (uang keluar)
      const direction = data.category === 'Pembayaran Proyek' ? 'income' : 'expense';

      // 2. Create Transaction
      const trx = await tx.transaction.create({
        data: {
          id: `trx-${uuidv4().substring(0, 8)}`,
          accountId: data.accountId,
          type: direction,
          category: data.category,
          amount: data.amount,
          date: data.date,
          description: data.description,
          proofUrl: data.proofUrl,
          invoiceId: data.invoiceId || null,
        }
      });

      // 3. Update CashAccount balance
      const account = await tx.cashAccount.findUnique({ where: { id: data.accountId } });
      if (!account) throw new Error("Rekening tidak ditemukan");

      const newBalance = direction === 'income' 
        ? Number(account.balance) + data.amount 
        : Number(account.balance) - data.amount;

      await tx.cashAccount.update({
        where: { id: data.accountId },
        data: { balance: newBalance }
      });

      // 4. Update Invoice (if Pembayaran Proyek)
      if (data.invoiceId && data.invoiceStatus) {
        const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
        if (invoice) {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { 
              status: data.invoiceStatus,
              paidAmount: Number(invoice.paidAmount) + data.amount
            }
          });
        }
      }

      return trx;
    });

    revalidatePath('/transactions');
    revalidatePath('/cash');
    revalidatePath('/dashboard');
    if (data.invoiceId) revalidatePath('/invoices');

    return { success: true };
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return { error: error.message || 'Gagal mencatat transaksi.' };
  }
}

// UPDATE transaction
export async function updateTransaction(id: string, data: {
  accountId: string;
  type: string; 
  category: string;
  amount: number;
  date: Date;
  description: string;
  proofUrl?: string;
  invoiceId?: string;
  invoiceStatus?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({ where: { id } });
      if (!existing) throw new Error("Transaksi tidak ditemukan");

      // 1. Revert previous cash account impact
      const oldAccount = await tx.cashAccount.findUnique({ where: { id: existing.accountId } });
      if (oldAccount) {
        const revertedBalance = existing.type === 'income'
          ? Number(oldAccount.balance) - Number(existing.amount)
          : Number(oldAccount.balance) + Number(existing.amount);

        await tx.cashAccount.update({
          where: { id: existing.accountId },
          data: { balance: revertedBalance } // Temporarily revert
        });
      }

      // 2. Revert previous invoice impact (if any)
      if (existing.invoiceId) {
        const oldInvoice = await tx.invoice.findUnique({ where: { id: existing.invoiceId } });
        if (oldInvoice) {
          await tx.invoice.update({
            where: { id: existing.invoiceId },
            data: {
              paidAmount: Number(oldInvoice.paidAmount) - Number(existing.amount),
              // We don't magically know the previous status, we leave it, 
              // but if the new invoice is the same, we will overwrite it in step 4 anyway.
            }
          });
        }
      }

      // 3. Apply NEW transaction details
      const direction = data.category === 'Pembayaran Proyek' ? 'income' : 'expense';
      
      const updatedTrx = await tx.transaction.update({
        where: { id },
        data: {
          accountId: data.accountId,
          type: direction,
          category: data.category,
          amount: data.amount,
          date: data.date,
          description: data.description,
          proofUrl: data.proofUrl,
          invoiceId: data.invoiceId || null,
        }
      });

      // 4. Apply NEW cash flow impact
      const newAccount = await tx.cashAccount.findUnique({ where: { id: data.accountId } });
      if (newAccount) {
        const finalBalance = direction === 'income'
          ? Number(newAccount.balance) + data.amount
          : Number(newAccount.balance) - data.amount;

        await tx.cashAccount.update({
          where: { id: data.accountId },
          data: { balance: finalBalance }
        });
      }

      // 5. Apply NEW invoice impact
      if (data.invoiceId && data.invoiceStatus) {
        const newInvoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
        if (newInvoice) {
          await tx.invoice.update({
            where: { id: newInvoice.id },
            data: {
              status: data.invoiceStatus,
              paidAmount: Number(newInvoice.paidAmount) + data.amount
            }
          });
        }
      }

      return updatedTrx;
    });

    revalidatePath('/transactions');
    revalidatePath('/cash');
    revalidatePath('/dashboard');
    revalidatePath('/invoices');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return { error: error.message || 'Gagal mengubah transaksi.' };
  }
}

// DELETE transaction
export async function deleteTransaction(id: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({ where: { id } });
      if (!existing) throw new Error("Transaksi tidak ditemukan");

      // 1. Revert cash account impact
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

      // 2. Revert invoice impact (if any)
      if (existing.invoiceId) {
        const invoice = await tx.invoice.findUnique({ where: { id: existing.invoiceId } });
        if (invoice) {
          const newPaidAmount = Number(invoice.paidAmount) - Number(existing.amount);
          // Simple rollback for status logic: if paidAmount becomes 0 = pending, else partial.
          // This is a naive heuristic because we don't have historical status tracking,
          // but works well enough for general use cases.
          // If the invoice was overdue, we leave it overdue realistically, but simplified here:
          const newStatus = 
             invoice.status === 'overdue' ? 'overdue' : 
             (newPaidAmount <= 0 ? 'pending' : 'partial');

          await tx.invoice.update({
            where: { id: existing.invoiceId },
            data: {
              paidAmount: newPaidAmount,
              status: newStatus
            }
          });
        }
      }

      // 3. Delete
      await tx.transaction.delete({ where: { id } });

      return true;
    });

    revalidatePath('/transactions');
    revalidatePath('/cash');
    revalidatePath('/dashboard');
    revalidatePath('/invoices');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return { error: error.message || 'Gagal menghapus transaksi.' };
  }
}
