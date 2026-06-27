export function calculateStreakUpdate(streakDays, lastSeenDate) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let days = streakDays || [];

  if (days.includes(today)) {
    return { changed: false, streak_days: days, current_streak: days.length };
  }

  if (days.includes(yesterday)) {
    days = [...days, today];
    return { changed: true, streak_days: days, current_streak: days.length };
  }

  return { changed: true, streak_days: [today], current_streak: 1 };
}

export function getLast7Days(streakDays) {
  const result = [];
  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    const dateStr = date.toISOString().split("T")[0];
    result.push({
      dateStr,
      dayName: dayNames[date.getDay()],
      attended: (streakDays || []).includes(dateStr),
    });
  }
  return result;
}