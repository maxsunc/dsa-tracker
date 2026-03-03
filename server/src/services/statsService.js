const prisma = require('../lib/prisma');

/**
 * Calculate the current streak (consecutive days with at least 1 review).
 */
async function calculateStreak(userId) {
  let streak = 0;
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const dayStart = new Date(currentDate);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.reviewHistory.count({
      where: {
        userProblem: { userId },
        reviewedAt: { gte: dayStart, lte: dayEnd },
      },
    });

    if (count > 0) {
      streak += 1;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = { calculateStreak };
