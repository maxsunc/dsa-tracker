const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided', code: 'NO_TOKEN' });

  try {
    const { userId } = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
};
