const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/register (admin only, for seeding)
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role, email, phone } = req.body;

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(409).json({ error: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role: role || 'EMPLOYEE', email, phone },
    });

    res.status(201).json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token.' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, name: true, role: true, email: true, phone: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
});

module.exports = router;
