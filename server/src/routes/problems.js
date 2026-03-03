const router = require('express').Router();
const prisma = require('../lib/prisma');
const { createProblemSchema } = require('../schemas/problem');

// ── List all problems (filterable) ───────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { category, difficulty, pattern, search, page = 1, limit = 50 } = req.query;
    const where = {};

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (pattern) where.pattern = pattern;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { leetcodeNumber: isNaN(Number(search)) ? undefined : Number(search) },
      ].filter(Boolean);
      // Remove undefined entries from OR
      if (where.OR.length === 0) delete where.OR;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy: { leetcodeNumber: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.problem.count({ where }),
    ]);

    res.json({ problems, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// ── Get single problem ───────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!problem) return res.status(404).json({ error: 'Problem not found', code: 'NOT_FOUND' });
    res.json(problem);
  } catch (err) {
    next(err);
  }
});

// ── Add custom problem ───────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const data = createProblemSchema.parse(req.body);
    const problem = await prisma.problem.create({ data });
    res.status(201).json(problem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
