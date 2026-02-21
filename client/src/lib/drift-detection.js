/**
 * Logic to detect "health drift" (declining trends) from check-in history
 */

export const detectDrift = (history) => {
  if (!history || history.length < 3) return { degree: 0, status: "stable" };

  // Sort by date descending
  const sorted = [...history].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  const moods = sorted.map((c) => c.mood).filter((m) => m !== undefined);
  if (moods.length < 3) return { degree: 0, status: "stable" };

  // Calculate moving average trend
  const latestBatch = moods.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const previousBatch = moods.slice(1, 4).reduce((a, b) => a + b, 0) / 3;

  const diff = previousBatch - latestBatch;

  if (diff > 0.5)
    return { degree: Math.min(diff * 20, 100), status: "warning" };
  if (moods[0] <= 2) return { degree: 40, status: "caution" };

  return { degree: 0, status: "stable" };
};

export const generateContextualMessage = (status, profile) => {
  const name = profile?.name || "there";

  switch (status) {
    case "warning":
      return `Hey ${name}, I've noticed a slight decline in your energy levels over the last few days. It might be worth taking a lighter day today.`;
    case "caution":
      return `Hi ${name}, you've reported feeling a bit low today. Remember that hydration and a short walk can sometimes help reset your mood.`;
    case "stable":
    default:
      return `Looking good, ${name}! Your consistency is showing in your metrics. Keep it up!`;
  }
};
