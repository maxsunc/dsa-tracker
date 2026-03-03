require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const problemRoutes = require('./routes/problems');
const userProblemRoutes = require('./routes/userProblems');
const reviewRoutes = require('./routes/reviews');
const statsRoutes = require('./routes/stats');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── CORS ─────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ── Body parsing & cookies ────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// ── Passport (no sessions — we use JWT) ───────────────────
app.use(passport.initialize());

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/user', authMiddleware, userProblemRoutes);
app.use('/api/reviews', authMiddleware, reviewRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

// ── 404 catch-all ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' });
});

// ── Global error handler (must be last) ──────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
