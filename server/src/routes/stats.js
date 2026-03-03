const router = require('express').Router();
const prisma = require('../lib/prisma');
const { calculateStreak } = require('../services/statsService');

// ── Overview stats ───────────────────────────────────────
router.get('/overview', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalInQueue, dueToday, overdue, totalCompleted, totalReviews] = await Promise.all([
      prisma.userProblem.count({ where: { userId, status: 'in_review' } }),
      prisma.userProblem.count({
        where: {
          userId,
          status: 'in_review',
          nextReviewDate: { gte: startOfDay, lte: today },
        },
      }),
      prisma.userProblem.count({
        where: {
          userId,
          status: 'in_review',
          nextReviewDate: { lt: startOfDay },
        },
      }),
      prisma.userProblem.count({
        where: { userId, status: { in: ['completed', 'in_review'] } },
      }),
      prisma.reviewHistory.count({
        where: { userProblem: { userId } },
      }),
    ]);

    const totalProblems = await prisma.problem.count();
    const completionRate = totalProblems > 0 ? Math.round((totalCompleted / totalProblems) * 1000) / 10 : 0;
    const currentStreak = await calculateStreak(userId);

    res.json({
      totalInQueue,
      dueToday,
      overdue,
      totalCompleted,
      totalReviews,
      currentStreak,
      completionRate,
    });
  } catch (err) {
    next(err);
  }
});

// ── Review history for charts ────────────────────────────
router.get('/history', async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const reviews = await prisma.reviewHistory.findMany({
      where: {
        userProblem: { userId: req.user.id },
        reviewedAt: { gte: startDate },
      },
      orderBy: { reviewedAt: 'asc' },
    });

    // Group by date
    const grouped = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      grouped[d.toISOString().split('T')[0]] = 0;
    }
    for (const review of reviews) {
      const key = review.reviewedAt.toISOString().split('T')[0];
      if (grouped[key] !== undefined) grouped[key]++;
    }

    const history = Object.entries(grouped).map(([date, reviewCount]) => ({
      date,
      reviewCount,
    }));

    res.json(history);
  } catch (err) {
    next(err);
  }
});

// ── Heatmap data ─────────────────────────────────────────
router.get('/heatmap', async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    const reviews = await prisma.reviewHistory.findMany({
      where: {
        userProblem: { userId: req.user.id },
        reviewedAt: { gte: startDate, lte: endDate },
      },
    });

    // Group by date
    const grouped = {};
    for (const review of reviews) {
      const key = review.reviewedAt.toISOString().split('T')[0];
      grouped[key] = (grouped[key] || 0) + 1;
    }

    const heatmap = Object.entries(grouped).map(([date, count]) => ({ date, count }));
    res.json(heatmap);
  } catch (err) {
    next(err);
  }
});

// ── Category breakdown ───────────────────────────────────
router.get('/categories', async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get all problems grouped by category
    const problems = await prisma.problem.findMany();
    const userProblems = await prisma.userProblem.findMany({
      where: { userId, status: { in: ['completed', 'in_review'] } },
    });

    const completedSet = new Set(userProblems.map((up) => up.problemId));

    const categoryMap = {};
    for (const p of problems) {
      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { category: p.category, total: 0, completed: 0 };
      }
      categoryMap[p.category].total++;
      if (completedSet.has(p.id)) categoryMap[p.category].completed++;
    }

    const categories = Object.values(categoryMap).map((c) => ({
      ...c,
      pct: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
    }));

    res.json(categories);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
