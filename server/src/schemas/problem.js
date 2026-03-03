const { z } = require('zod');

const createProblemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  leetcodeUrl: z.string().url('Must be a valid URL'),
  leetcodeNumber: z.number().int().positive(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string().min(1).max(100),
  pattern: z.string().min(1).max(100),
});

module.exports = { createProblemSchema };
