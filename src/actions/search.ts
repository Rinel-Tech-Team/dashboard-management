'use server';

import { prisma } from '@/lib/prisma';

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();

  const [employees, projects, invoices, transactions] = await Promise.all([
    prisma.employee.findMany({
      where: {
        OR: [
          { name: { contains: lowerQuery, mode: 'insensitive' } },
          { position: { contains: lowerQuery, mode: 'insensitive' } },
        ]
      },
      take: 5
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: lowerQuery, mode: 'insensitive' } },
          { client: { contains: lowerQuery, mode: 'insensitive' } },
        ]
      },
      take: 5
    }),
    prisma.invoice.findMany({
      where: {
        OR: [
          { number: { contains: lowerQuery, mode: 'insensitive' } },
          { description: { contains: lowerQuery, mode: 'insensitive' } },
        ]
      },
      take: 5
    }),
    prisma.transaction.findMany({
      where: {
        description: { contains: lowerQuery, mode: 'insensitive' }
      },
      take: 5
    })
  ]);

  const results = [
    ...employees.map(e => ({ type: 'Karyawan', label: `${e.name} (${e.position})`, href: `/employees` })),
    ...projects.map(p => ({ type: 'Proyek', label: p.name, href: `/projects/${p.id}` })),
    ...invoices.map(i => ({ type: 'Invoice', label: i.number, href: `/invoices/${i.id}` })),
    ...transactions.map(t => ({ type: 'Transaksi', label: t.description, href: `/transactions` }))
  ];

  return results;
}
