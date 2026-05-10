const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const count = await prisma.customer.count();
    console.log('Customer count OK:', count);

    const year = new Date().getFullYear();
    const customerId = `BF-${year}-${String(count + 1).padStart(3, '0')}`;
    console.log('Would generate customerId:', customerId);

    const c = await prisma.customer.create({
      data: {
        customerId,
        name: 'Test User',
        phone: '9999999999',
        createdById: null,
      }
    });
    console.log('Customer created OK:', c.id, c.customerId);

    await prisma.customer.delete({ where: { id: c.id } });
    console.log('Cleanup done');

    // Test loan creation too
    const cu = await prisma.customer.create({
      data: { customerId: 'TEST-LOAN', name: 'Loan Test', createdById: null }
    });
    const l = await prisma.loan.create({
      data: {
        customerId: cu.id,
        loanType: 'VEHICLE',
        amount: 100000,
        tenure: 12,
        interestRate: 12,
        emi: 9000,
        frequency: 'MONTHLY',
        purpose: 'Test',
        status: 'PENDING',
        fullData: '{}',
        createdById: null,
      }
    });
    console.log('Loan created OK:', l.id);
    await prisma.loan.delete({ where: { id: l.id } });
    await prisma.customer.delete({ where: { id: cu.id } });
    console.log('All tests passed!');
  } catch (e) {
    console.error('ERROR:', e.message);
    if (e.code) console.error('Prisma code:', e.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();
