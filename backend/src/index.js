const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const loanRoutes = require('./routes/loans');
const repaymentRoutes = require('./routes/repayments');
const notificationRoutes = require('./routes/notifications');
const expenseRoutes = require('./routes/expenses');
const investmentRoutes = require('./routes/investments');
const settingRoutes = require('./routes/settings');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');
const auditRoutes = require('./routes/audit');
const { initPenaltyJob } = require('./jobs/penaltyJob');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function autoSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('🌱 No users found. Auto-seeding default admin...');
      const adminPassword = await bcrypt.hash('admin123', 12);
      await prisma.user.create({
        data: { 
          username: 'admin', 
          password: adminPassword, 
          name: 'Admin User', 
          role: 'ADMIN', 
          email: 'admin@bossfinance.in', 
          phone: '+918888877777' 
        },
      });
      console.log('✅ Default admin (admin/admin123) created.');
    }
  } catch (err) {
    console.error('❌ Auto-seed failed:', err);
  }
}

const PORT = process.env.PORT || 5000;
const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'https://boss-finance-80gk5f5or-codeorbit-techs-projects.vercel.app',
];

function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return DEFAULT_CORS_ORIGINS;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function createApp() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Cashfree webhook must be before express.json to preserve raw body.
  app.use('/webhook/cashfree', express.raw({ type: 'application/json' }), require('./routes/cashfreeWebhook'));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/loans', loanRoutes);
  app.use('/api/repayments', repaymentRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/investments', investmentRoutes);
  app.use('/api/settings', settingRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/cashfree', require('./routes/cashfree'));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}

function startServer(port = PORT) {
  const app = createApp();
  const server = app.listen(port, async () => {
    console.log(`Boss Finance API running on http://localhost:${port}`);
    await autoSeed();
    initPenaltyJob();
  });

  server.on('error', (err) => {
    console.error('SERVER BIND ERROR:', err);
  });

  return server;
}

const app = createApp();

if (require.main === module) {
  startServer();
}

module.exports = { app, createApp, startServer };
