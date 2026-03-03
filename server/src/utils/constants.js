// Spaced repetition constants
const BASE_INTERVALS = [1, 3, 7, 14, 30, 90, 180, 365];

const RATING_MULTIPLIERS = {
  easy: 1.5,
  medium: 1.0,
  hard: 0.7,
};

const EASE_DELTA = {
  easy: 0.1,
  medium: 0.0,
  hard: -0.15,
};

const EASE_MIN = 0.5;
const EASE_MAX = 2.5;

module.exports = {
  BASE_INTERVALS,
  RATING_MULTIPLIERS,
  EASE_DELTA,
  EASE_MIN,
  EASE_MAX,
};
