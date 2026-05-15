const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isYesterday = (last, now) => {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return sameDay(last, y);
};

/**
 * Updates the user's streak based on an activity (e.g. completing a task).
 * - Same day as last activity: no change.
 * - Yesterday: increment.
 * - Older or never: reset to 1.
 */
const recordStreakActivity = async (user) => {
  const now = new Date();
  const last = user.lastActivityAt ? new Date(user.lastActivityAt) : null;

  if (last && sameDay(last, now)) {
    // already counted today
    return user.streakCount;
  }

  if (last && isYesterday(last, now)) {
    user.streakCount = (user.streakCount || 0) + 1;
  } else {
    user.streakCount = 1;
  }
  user.lastActivityAt = now;
  await user.save();
  return user.streakCount;
};

module.exports = { recordStreakActivity };
