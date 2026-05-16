const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const customerId = 'cmp5oyisr0001p7fzt3ae4uqi';
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      loans: { 
        include: { 
          repayments: { 
            where: { paymentType: { not: 'UPFRONT_INTEREST' } },
            orderBy: { paidAt: 'desc' } 
          }
        } 
      }
    }
  });

  const repayments = customer.loans[0].repayments;
  console.log('Repayments found in query:', repayments.length);
  repayments.forEach(r => console.log(`- Type: ${r.paymentType}, Amount: ${r.amount}`));
  process.exit(0);
}

check();
