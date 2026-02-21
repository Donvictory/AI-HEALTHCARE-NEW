/**
 * Logic to detect "health drift" (declining trends) from check-in history
 */

export const detectDrift = (history, profile) => {
  // Default values for cases with no data
  if (!history || history.length === 0) {
    return {
      driftLevel: "optimal",
      resilienceScore: 100,
      alerts: [],
    };
  }

  // Extract latest metrics
  const latest = history[history.length - 1];

  // Calculate a basic resilience score (0-100)
  // Factors: Stress (inverse), Mood, Sleep, Activity, Hydration
  const stressFactor = (10 - latest.stressLevel) * 2; // 0-20
  const moodFactor = latest.mood * 2; // 0-20
  const sleepFactor = Math.min((latest.hoursSlept / 8) * 20, 20); // 0-20
  const activityFactor = Math.min((latest.physicalActivity / 30) * 20, 20); // 0-20
  const hydrationFactor = Math.min((latest.waterIntake / 8) * 20, 20); // 0-20

  const resilienceScore = Math.round(
    stressFactor + moodFactor + sleepFactor + activityFactor + hydrationFactor,
  );

  // Detect Drift Level
  // We compare the latest check-in to previous ones if they exist
  let driftLevel = "optimal";
  const alerts = [];

  if (history.length >= 3) {
    const recentAvgMood =
      history.slice(-3).reduce((acc, curr) => acc + curr.mood, 0) / 3;
    const prevAvgMood =
      history.length >= 6
        ? history.slice(-6, -3).reduce((acc, curr) => acc + curr.mood, 0) / 3
        : history[0].mood;

    const moodDrift = prevAvgMood - recentAvgMood;

    if (moodDrift > 2 || resilienceScore < 40) {
      driftLevel = "critical";
      alerts.push({
        severity: "high",
        message: "Significant decline detected in your adaptive capacity.",
        recommendation:
          "Please consider reaching out to a professional or taking an immediate rest day.",
      });
    } else if (moodDrift > 1 || resilienceScore < 60) {
      driftLevel = "concern";
      alerts.push({
        severity: "medium",
        message: "Your health patterns are showing a concerning shift.",
        recommendation:
          "Try to prioritize sleep and hydration over the next 48 hours.",
      });
    } else if (moodDrift > 0.5 || resilienceScore < 80) {
      driftLevel = "watch";
      alerts.push({
        severity: "low",
        message: "Minor drift detected in your daily metrics.",
        recommendation:
          "Keep an eye on your stress levels and ensure you're taking short breaks.",
      });
    }
  }

  // Personal context alerts (e.g., BMI)
  if (profile?.bmi > 30) {
    alerts.push({
      severity: "low",
      message: "Your BMI is in the high range.",
      recommendation:
        "Consult with a nutritionist to align your diet with your health goals.",
    });
  }

  return {
    driftLevel,
    resilienceScore,
    alerts,
  };
};

export const generateContextualMessage = (
  driftLevel,
  resilienceScore,
  profile,
) => {
  const name = profile?.name || "there";

  if (resilienceScore > 80 && driftLevel === "optimal") {
    return `You're doing great, ${name}! Your resilience tank is full and your patterns are stable.`;
  }

  if (driftLevel === "critical") {
    return `Hey ${name}, your metrics suggest you're under significant pressure. It's time to prioritize your recovery.`;
  }

  if (driftLevel === "concern" || driftLevel === "watch") {
    return `Hi ${name}, I've noticed some shifts in your health patterns. Let's focus on small wins today.`;
  }

  return `Welcome back, ${name}. Keep recording your daily check-ins to unlock deeper insights.`;
};
