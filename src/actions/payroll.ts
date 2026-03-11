'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function createPayroll(data: {
  accountId: string;
  employeeIds: string[];
  period: string;
  type: string;
  date: Date;
  notes: string;
  proofUrl?: string;
  manualAmount?: number;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const payrollId = `prl-${uuidv4().substring(0, 8)}`;
      
      const employees = await tx.employee.findMany({
        where: { id: { in: data.employeeIds } }
      });

      let calculatedTotal = 0;
      
      const typeString = data.type || '';
      const parsedTypes = typeString.split(',').map(t => t.trim());
      
      const isLemburOnly = parsedTypes.length === 1 && parsedTypes.includes('Lembur/Tambahan');
      const includesLembur = parsedTypes.includes('Lembur/Tambahan');
      const includesGaji = parsedTypes.includes('Gaji Bulanan');
      const includesTHR = parsedTypes.includes('THR/Bonus');
      
      const manualPerEmp = data.manualAmount || 0;

      const details = employees.map(emp => {
        let baseAmount = 0;
        
        if (includesGaji && includesTHR) {
          baseAmount = Number(emp.salary) + Number(emp.allowance);
        } else if (includesGaji) {
          baseAmount = Number(emp.salary);
        } else if (includesTHR && !includesGaji) {
          baseAmount = Number(emp.allowance);
        } else if (isLemburOnly) {
          baseAmount = 0;
        } else {
          baseAmount = Number(emp.salary) + Number(emp.allowance);
        }
        
        let finalAmount = baseAmount;
        if (includesLembur) {
          finalAmount += manualPerEmp;
        }

        calculatedTotal += finalAmount;
        
        return {
          id: `det-${uuidv4().substring(0, 8)}`,
          payrollId: payrollId,
          employeeId: emp.id,
          amount: finalAmount
        };
      });

      const payroll = await tx.payroll.create({
        data: {
          id: payrollId,
          period: data.period,
          type: data.type,
          date: data.date,
          employeeCount: data.employeeIds.length,
          totalAmount: calculatedTotal,
          status: 'paid',
          notes: data.notes,
          proofUrl: data.proofUrl,
          accountId: data.accountId,
        }
      });

      await tx.payrollDetail.createMany({
        data: details
      });

      // Deduct cash account
      await tx.cashAccount.update({
        where: { id: data.accountId },
        data: { balance: { decrement: calculatedTotal } }
      });

      // Create a matching transaction record so it shows up in Kas & Tabungan
      await tx.transaction.create({
        data: {
          id: `trx-${uuidv4().substring(0, 8)}`,
          accountId: data.accountId,
          type: 'expense',
          category: 'Gaji',
          amount: calculatedTotal,
          date: data.date,
          description: `Pembayaran Payroll: ${data.period} (${data.type})`,
          proofUrl: data.proofUrl,
        }
      });

      return payroll;
    });

    revalidatePath('/payroll');
    revalidatePath('/dashboard');
    
    return { 
      success: true, 
      payroll: {
        ...result,
        totalAmount: Number(result.totalAmount),
        date: result.date.toISOString(),
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      } 
    };
  } catch (error) {
    console.error('Error creating payroll:', error);
    return { error: 'Gagal mencatat data payroll.' };
  }
}

export async function getPayrolls() {
  try {
    const rawPayrolls = await prisma.payroll.findMany({
      orderBy: { date: 'desc' },
      include: {
        account: true,
      }
    });
    
    // Map Decimal and Date to primitives
    const payrolls = rawPayrolls.map(pr => ({
      ...pr,
      totalAmount: Number(pr.totalAmount),
      date: pr.date.toISOString(),
      createdAt: pr.createdAt.toISOString(),
      updatedAt: pr.updatedAt.toISOString(),
      account: pr.account ? {
        ...pr.account,
        balance: Number(pr.account.balance),
        createdAt: pr.account.createdAt.toISOString(),
        updatedAt: pr.account.updatedAt.toISOString(),
      } : null
    }));

    return { success: true, payrolls };
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    return { error: 'Gagal mengambil data payroll' };
  }
}

export async function getPayrollById(id: string) {
  try {
    const rawPayroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        account: true,
        details: {
          include: {
            employee: true
          }
        }
      }
    });

    if (!rawPayroll) return { error: 'Payroll tidak ditemukan' };

    // Format for client
    const payroll = {
      ...rawPayroll,
      totalAmount: Number(rawPayroll.totalAmount),
      date: rawPayroll.date.toISOString(),
      createdAt: rawPayroll.createdAt.toISOString(),
      updatedAt: rawPayroll.updatedAt.toISOString(),
      account: rawPayroll.account ? {
        ...rawPayroll.account,
        balance: Number(rawPayroll.account.balance),
        createdAt: rawPayroll.account.createdAt.toISOString(),
        updatedAt: rawPayroll.account.updatedAt.toISOString(),
      } : null,
      details: (rawPayroll.details as any[]).map(d => ({
        ...d,
        amount: Number(d.amount),
        employee: d.employee ? {
          ...d.employee,
          salary: Number(d.employee.salary),
          allowance: Number(d.employee.allowance),
          joinDate: d.employee.joinDate.toISOString(),
          createdAt: d.employee.createdAt.toISOString(),
          updatedAt: d.employee.updatedAt.toISOString(),
        } : null
      }))
    };

    return { success: true, payroll };
  } catch (error) {
    console.error('Error fetching payroll by ID:', error);
    return { error: 'Gagal mengambil detail payroll' };
  }
}

export async function updatePayroll(id: string, data: {
  accountId: string;
  employeeIds: string[];
  period: string;
  type: string;
  date: Date;
  notes: string;
  proofUrl?: string;
  manualAmount?: number;
}) {
  try {
    const employees = await prisma.employee.findMany({
      where: { id: { in: data.employeeIds } }
    });

    // Run transaction to ensure consistency
    const updatedPayroll = await prisma.$transaction(async (tx) => {
      // Get the existing payroll to reverse its cash effects
      const existingPayroll = await tx.payroll.findUnique({ where: { id } });
      if (!existingPayroll) throw new Error("Payroll tidak ditemukan");

      // Refund the old account
      await tx.cashAccount.update({
        where: { id: existingPayroll.accountId },
        data: { balance: { increment: existingPayroll.totalAmount } }
      });

      let calculatedTotal = 0;
      
      const typeString = data.type || '';
      const parsedTypes = typeString.split(',').map(t => t.trim());
      
      const isLemburOnly = parsedTypes.length === 1 && parsedTypes.includes('Lembur/Tambahan');
      const includesLembur = parsedTypes.includes('Lembur/Tambahan');
      const includesGaji = parsedTypes.includes('Gaji Bulanan');
      const includesTHR = parsedTypes.includes('THR/Bonus');
      
      const manualPerEmp = data.manualAmount || 0;

      const details = employees.map(emp => {
        let baseAmount = 0;
        
        if (includesGaji && includesTHR) {
          baseAmount = Number(emp.salary) + Number(emp.allowance);
        } else if (includesGaji) {
          baseAmount = Number(emp.salary);
        } else if (includesTHR && !includesGaji) {
          baseAmount = Number(emp.allowance);
        } else if (isLemburOnly) {
          baseAmount = 0;
        } else {
          baseAmount = Number(emp.salary) + Number(emp.allowance);
        }
        
        let finalAmount = baseAmount;
        if (includesLembur) {
          finalAmount += manualPerEmp;
        }

        calculatedTotal += finalAmount;
        
        return {
          id: `det-${uuidv4().substring(0, 8)}`,
          payrollId: id,
          employeeId: emp.id,
          amount: finalAmount
        };
      });

      // 1. Update main record
      const payroll = await tx.payroll.update({
        where: { id },
        data: {
          period: data.period,
          type: data.type,
          date: data.date,
          employeeCount: data.employeeIds.length,
          totalAmount: calculatedTotal,
          notes: data.notes,
          proofUrl: data.proofUrl,
          accountId: data.accountId,
        }
      });

      // 2. Delete existing details
      await tx.payrollDetail.deleteMany({
        where: { payrollId: id }
      });

      // 3. Create new details based on current selection
      await tx.payrollDetail.createMany({
        data: details
      });

      // 4. Update the related transaction in Kas & Tabungan
      // We know descriptions align with the previous createPayroll pattern
      const relatedTrx = await tx.transaction.findFirst({
        where: {
          accountId: existingPayroll.accountId,
          category: 'Gaji',
          date: existingPayroll.date,
          amount: existingPayroll.totalAmount
        }
      });

      if (relatedTrx) {
        await tx.transaction.update({
          where: { id: relatedTrx.id },
          data: {
            accountId: data.accountId,
            amount: calculatedTotal,
            date: data.date,
            description: `Pembayaran Payroll: ${data.period} (${data.type})`,
            proofUrl: data.proofUrl,
          }
        });
      }

      // Deduct from the new account
      await tx.cashAccount.update({
        where: { id: data.accountId },
        data: { balance: { decrement: calculatedTotal } }
      });

      return payroll;
    });

    revalidatePath('/payroll');
    revalidatePath(`/payroll/${id}`);
    revalidatePath(`/payroll/${id}/edit`);

    return { 
      success: true, 
      payroll: {
        ...updatedPayroll,
        totalAmount: Number(updatedPayroll.totalAmount),
        date: updatedPayroll.date.toISOString(),
        createdAt: updatedPayroll.createdAt.toISOString(),
        updatedAt: updatedPayroll.updatedAt.toISOString(),
      } 
    };
  } catch (error) {
    console.error('Error updating payroll:', error);
    return { error: 'Gagal mengupdate data payroll.' };
  }
}

export async function deletePayroll(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const payroll = await tx.payroll.findUnique({ where: { id } });
      if (payroll) {
        // Refund the cash account
        await tx.cashAccount.update({
          where: { id: payroll.accountId },
          data: { balance: { increment: payroll.totalAmount } }
        });

        // Delete the matching transaction in Kas & Tabungan
        const relatedTrx = await tx.transaction.findFirst({
          where: {
            accountId: payroll.accountId,
            category: 'Gaji',
            date: payroll.date,
            amount: payroll.totalAmount
          }
        });

        if (relatedTrx) {
          await tx.transaction.delete({
            where: { id: relatedTrx.id }
          });
        }
      }

      await tx.payrollDetail.deleteMany({
        where: { payrollId: id }
      });
      
      await tx.payroll.delete({
        where: { id }
      });
    });

    revalidatePath('/payroll');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting payroll:', error);
    return { error: 'Gagal menghapus data payroll' };
  }
}
