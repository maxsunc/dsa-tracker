const { z } = require('zod');

const reviewSubmitSchema = z.object({
  rating: z.enum(['easy', 'medium', 'hard']),
});

module.exports = { reviewSubmitSchema };
