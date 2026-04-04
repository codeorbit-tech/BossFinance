const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/notifications — list notification history
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        skip,
        take: parseInt(limit),
        orderBy: { sentAt: 'desc' },
        include: { customer: { select: { customerId: true, name: true } } },
      }),
      prisma.notification.count(),
    ]);

    res.json({ notifications, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/notifications/send — send notification
router.post('/send', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { customerIds, channel, template, message } = req.body;

    // TODO: Phase 6 — Integrate Twilio for actual SMS/WhatsApp sending

    const notifications = await Promise.all(
      customerIds.map(async (customerId) => {
        return prisma.notification.create({
          data: {
            customerId,
            channel: channel || 'SMS',
            template: template || 'CUSTOM',
            message,
            status: 'SENT', // Will be updated by Twilio callback
            sentAt: new Date(),
            sentById: req.user.id,
          },
        });
      })
    );

    res.status(201).json({ notifications, count: notifications.length });
  } catch (err) {
    console.error('Send notification error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
