const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ── Get all user's tracked problems ──────────────────────
router.get('/problems', async (req, res, next) => {
  try {
    const userProblems = await prisma.userProblem.findMany({
      where: { userId: req.user.id },
      include: { problem: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(userProblems);
  } catch (err) {
    next(err);
  }
});

// ── Mark problem as completed ────────────────────────────
router.post('/problems/:problemId/complete', async (req, res, next) => {
  try {
    const problemId = Number(req.params.problemId);

    // Verify problem exists
    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' });

    // Upsert user-problem relationship
    const now = new Date();
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + 1); // First review in 1 day

    const userProblem = await prisma.userProblem.upsert({
      where: { userId_problemId: { userId: req.user.id, problemId } },
      update: {
        status: 'in_review',
        completedAt: now,
        nextReviewDate,
        currentInterval: 1,
      },
      create: {
        userId: req.user.id,
        problemId,
        status: 'in_review',
        completedAt: now,
        nextReviewDate,
        currentInterval: 1,
      },
      include: { problem: true },
    });

    res.json(userProblem);
  } catch (err) {
    next(err);
  }
});

// ── Update notes ─────────────────────────────────────────
router.put('/problems/:problemId/notes', async (req, res, next) => {
  try {
    const problemId = Number(req.params.problemId);
    const { notes } = req.body;

    const userProblem = await prisma.userProblem.update({
      where: { userId_problemId: { userId: req.user.id, problemId } },
      data: { notes },
      include: { problem: true },
    });

    res.json(userProblem);
  } catch (err) {
    next(err);
  }
});

// ── Remove from tracking ─────────────────────────────────
router.delete('/problems/:problemId', async (req, res, next) => {
  try {
    const problemId = Number(req.params.problemId);

    await prisma.userProblem.delete({
      where: { userId_problemId: { userId: req.user.id, problemId } },
    });

    res.json({ message: 'Removed from tracking' });
  } catch (err) {
    next(err);
  }
});

// ── Reset review progress ────────────────────────────────
router.post('/problems/:problemId/reset', async (req, res, next) => {
  try {
    const problemId = Number(req.params.problemId);
    const now = new Date();
    const nextReviewDate = new Date(now);
    nextReviewDate.setDate(nextReviewDate.getDate() + 1);

    const userProblem = await prisma.userProblem.update({
      where: { userId_problemId: { userId: req.user.id, problemId } },
      data: {
        reviewCount: 0,
        currentInterval: 1,
        easeFactor: 1.0,
        nextReviewDate,
        status: 'in_review',
      },
      include: { problem: true },
    });

    res.json(userProblem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
