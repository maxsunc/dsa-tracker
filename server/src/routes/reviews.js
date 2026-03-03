const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { reviewSubmitSchema } = require('../schemas/review');
const { calculateNextReview } = require('../services/reviewScheduler');
const prisma = new PrismaClient();

// ── Get today's due + overdue problems ───────────────────
router.get('/due', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const dueProblems = await prisma.userProblem.findMany({
      where: {
        userId: req.user.id,
        status: 'in_review',
        nextReviewDate: { lte: today },
      },
      include: { problem: true },
      orderBy: { nextReviewDate: 'asc' },
    });

    // Split into overdue and due today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const overdue = dueProblems.filter((p) => p.nextReviewDate < startOfDay);
    const dueToday = dueProblems.filter((p) => p.nextReviewDate >= startOfDay);

    res.json({ overdue, dueToday });
  } catch (err) {
    next(err);
  }
});

// ── Get upcoming reviews ─────────────────────────────────
router.get('/upcoming', async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 7;
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    const endDate = new Date(startOfTomorrow);
    endDate.setDate(endDate.getDate() + days);

    const upcoming = await prisma.userProblem.findMany({
      where: {
        userId: req.user.id,
        status: 'in_review',
        nextReviewDate: { gte: startOfTomorrow, lt: endDate },
      },
      include: { problem: true },
      orderBy: { nextReviewDate: 'asc' },
    });

    res.json(upcoming);
  } catch (err) {
    next(err);
  }
});

// ── Submit review rating ─────────────────────────────────
router.post('/:userProblemId/submit', async (req, res, next) => {
  try {
    const { rating } = reviewSubmitSchema.parse(req.body);
    const { userProblemId } = req.params;

    const userProblem = await prisma.userProblem.findFirst({
      where: { id: userProblemId, userId: req.user.id },
    });

    if (!userProblem)
      return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' });

    const { nextInterval, easeFactor, nextReviewDate } = calculateNextReview(userProblem, rating);

    // Update user problem
    const updated = await prisma.userProblem.update({
      where: { id: userProblemId },
      data: {
        reviewCount: userProblem.reviewCount + 1,
        currentInterval: nextInterval,
        easeFactor,
        nextReviewDate,
      },
      include: { problem: true },
    });

    // Create immutable review history entry
    await prisma.reviewHistory.create({
      data: {
        userProblemId,
        rating,
        intervalUsed: userProblem.currentInterval,
        nextInterval,
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Skip to tomorrow ─────────────────────────────────────
router.post('/:userProblemId/skip', async (req, res, next) => {
  try {
    const { userProblemId } = req.params;

    const userProblem = await prisma.userProblem.findFirst({
      where: { id: userProblemId, userId: req.user.id },
    });

    if (!userProblem)
      return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const updated = await prisma.userProblem.update({
      where: { id: userProblemId },
      data: { nextReviewDate: tomorrow },
      include: { problem: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
