const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// --- Holiday Endpoints ---

router.get('/holidays', authenticate, async (req, res) => {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(holidays);
  } catch (err) {
    console.error('Get holidays error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/holidays', authenticate, async (req, res) => {
  try {
    const { date, name, type, state } = req.body;
    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name,
        type: type || 'NATIONAL',
        state: state || 'ALL',
      },
    });
    res.status(201).json(holiday);
  } catch (err) {
    console.error('Add holiday error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.delete('/holidays/:id', authenticate, async (req, res) => {
  try {
    await prisma.holiday.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Holiday deleted.' });
  } catch (err) {
    console.error('Delete holiday error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Global Settings Endpoints ---

router.get('/', authenticate, async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    // Convert to a more usable object format
    const settingsObj = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsObj);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description },
    });
    res.json(setting);
  } catch (err) {
    console.error('Update setting error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
