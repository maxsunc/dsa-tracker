const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  name: z.string().min(1, 'Name is required').max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };
