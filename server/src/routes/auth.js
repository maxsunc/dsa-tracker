const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const { PrismaClient } = require('@prisma/client');
const { registerSchema, loginSchema } = require('../schemas/auth');
const prisma = new PrismaClient();

const signTokens = (userId) => ({
  accessToken: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }),
});

// ── Email/Password Register ──────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already in use', code: 'EMAIL_TAKEN' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName: name },
    });

    const { accessToken, refreshToken } = signTokens(user.id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.displayName, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    next(err);
  }
});

// ── Email/Password Login ─────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash)
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });

    const { accessToken, refreshToken } = signTokens(user.id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      accessToken,
      user: { id: user.id, email: user.email, name: user.displayName, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    next(err);
  }
});

// ── Google OAuth ─────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const { accessToken, refreshToken } = signTokens(req.user.id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`);
  }
);

// ── Refresh Token ────────────────────────────────────────
router.post('/refresh', (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token', code: 'NO_REFRESH_TOKEN' });

  try {
    const { userId } = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
  }
});

// ── Get Current User ─────────────────────────────────────
router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token', code: 'NO_TOKEN' });

  try {
    const { userId } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });

    res.json({
      user: { id: user.id, email: user.email, name: user.displayName, avatarUrl: user.avatarUrl },
    });
  } catch {
    res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
});

// ── Logout ───────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

module.exports = router;
