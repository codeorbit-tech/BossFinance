const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const customerId = 'cmp5oyisr0001p7fzt3ae4uqi'; // MUSTHAFA.M
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      loans: {
        include: {
          repayments: true
        }
      }
    }
  });

  console.log(JSON.stringify(customer.loans[0].repayments, null, 2));
  process.exit(0);
}

check();
