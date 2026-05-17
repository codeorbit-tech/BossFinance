/**
 * One-time backfill: assign loanNumber (BF-YYYY-D01, BF-YYYY-W01, BF-YYYY-M01)
 * to all existing loans that don't have one yet.
 *
 * Priority rule: Musthafa's DAILY loan gets BF-2026-D01 (i.e., comes first).
 * All loans ordered oldest-first within each frequency bucket.
 *
 * Run: node prisma/backfill-loan-numbers.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FREQ_PREFIX = {
  DAILY: 'D',
  WEEKLY: 'W',
  MONTHLY: 'M',
};

async function main() {
  console.log('🔄  Starting loanNumber backfill...\n');

  const frequencies = ['DAILY', 'WEEKLY', 'MONTHLY'];

  for (const freq of frequencies) {
    const prefix = FREQ_PREFIX[freq];

    // Fetch all loans of this frequency that still have no loanNumber,
    // ordered oldest first — but put Musthafa's loan first inside DAILY bucket.
    let loans = await prisma.loan.findMany({
      where: {
        frequency: freq,
        loanNumber: null,
      },
      include: {
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (loans.length === 0) {
      console.log(`  ✅  No un-numbered ${freq} loans found — skipping.`);
      continue;
    }

    // For DAILY: move Musthafa's loan to the very front so it gets D01
    if (freq === 'DAILY') {
      const musthafaIdx = loans.findIndex((l) =>
        l.customer?.name?.toLowerCase().includes('musthafa')
      );
      if (musthafaIdx > 0) {
        const [musthafa] = loans.splice(musthafaIdx, 1);
        loans.unshift(musthafa);
        console.log(`  📌  Pinned ${musthafa.customer.name}'s loan to position 1 (gets ${freq[0]}01)`);
      } else if (musthafaIdx === 0) {
        console.log(`  📌  Musthafa already at position 1 — will get D01`);
      } else {
        console.log(`  ⚠️   No customer named "Musthafa" found among DAILY loans.`);
      }
    }

    // Find the highest already-assigned number for this frequency (in case of partial runs)
    const lastAssigned = await prisma.loan.findFirst({
      where: {
        frequency: freq,
        loanNumber: { not: null },
      },
      orderBy: { loanNumber: 'desc' },
      select: { loanNumber: true },
    });

    let counter = 1;
    if (lastAssigned?.loanNumber) {
      // Extract number from e.g. "BF-2026-D03" → 3
      const match = lastAssigned.loanNumber.match(/(\d+)$/);
      if (match) counter = parseInt(match[1], 10) + 1;
    }

    const year = new Date().getFullYear();

    for (const loan of loans) {
      const loanNumber = `BF-${year}-${prefix}${String(counter).padStart(2, '0')}`;
      await prisma.loan.update({
        where: { id: loan.id },
        data: { loanNumber },
      });
      console.log(
        `  ✔  [${freq}] ${loan.customer?.name?.padEnd(20)} → ${loanNumber}`
      );
      counter++;
    }
  }

  console.log('\n✅  Backfill complete!');
}

main()
  .catch((e) => {
    console.error('❌  Backfill failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
