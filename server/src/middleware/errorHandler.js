const { ZodError } = require('zod');

module.exports = (err, req, res, next) => {
  console.error(err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({
      error: messages.join(', '),
      code: 'VALIDATION_ERROR',
    });
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with that value already exists',
      code: 'DUPLICATE',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found',
      code: 'NOT_FOUND',
    });
  }

  // Default
  res.status(500).json({ error: 'Internal server error', code: 'SERVER_ERROR' });
};
