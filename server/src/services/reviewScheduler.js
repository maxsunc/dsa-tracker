const {
  BASE_INTERVALS,
  RATING_MULTIPLIERS,
  EASE_DELTA,
  EASE_MIN,
  EASE_MAX,
} = require('../utils/constants');

/**
 * Calculate the next review date based on the spaced repetition algorithm.
 *
 * @param {Object} userProblem - The user's problem record
 * @param {string} rating - "easy" | "medium" | "hard"
 * @returns {Object} { nextInterval, easeFactor, nextReviewDate }
 */
function calculateNextReview(userProblem, rating) {
  // 1. Update ease_factor based on this rating
  let easeFactor = userProblem.easeFactor + EASE_DELTA[rating];
  easeFactor = Math.max(EASE_MIN, Math.min(EASE_MAX, easeFactor));

  // 2. Pick base interval from progression
  const reviewIndex = Math.min(userProblem.reviewCount, BASE_INTERVALS.length - 1);
  const baseInterval = BASE_INTERVALS[reviewIndex];

  // 3. Apply rating multiplier AND accumulated ease factor
  let adjustedInterval = Math.round(baseInterval * RATING_MULTIPLIERS[rating] * easeFactor);
  adjustedInterval = Math.max(adjustedInterval, 1); // minimum 1 day

  // 4. Calculate next review date from today
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + adjustedInterval);

  return {
    nextInterval: adjustedInterval,
    easeFactor,
    nextReviewDate,
  };
}

module.exports = { calculateNextReview };
