import { IDailyCheckInEntity } from "../modules/daily-check-in/daily-check-in.entity";
import { scoringLogic } from "../config/health-params.config";

export function calculateResilience(checkIn: Partial<IDailyCheckInEntity>) {
  if (!checkIn) return { resilience: 0, breakdown: {} };

  const sleepScore = scoringLogic.hoursSlept(checkIn.hoursSlept || 0);
  const stressScore = scoringLogic.stressLevel(checkIn.stressLevel || 5);
  const moodScore = scoringLogic.currentMood(checkIn.currentMood || 5);
  const activityScore = scoringLogic.dailyActivity(
    checkIn.dailyActivityMeasure || 0,
  );
  const waterScore = scoringLogic.water(checkIn.numOfWaterGlasses || 0);
  const healthStatusScore = scoringLogic.healthStatus(
    checkIn.currentHealthStatus!,
  );
  const symptomsScore = scoringLogic.symptoms(checkIn.symptomsToday || []);
  const lifestyleScore = scoringLogic.lifestyle(checkIn.lifestyleChecks || []);

  const scores = [
    sleepScore,
    stressScore,
    moodScore,
    activityScore,
    waterScore,
    healthStatusScore,
    symptomsScore,
    lifestyleScore,
  ];

  const resilience = Math.round(
    scores.reduce((a, b) => a + b, 0) / scores.length,
  );

  let driftLevel = "OPTIMAL";
  if (resilience < 40) driftLevel = "CRITICAL";
  else if (resilience < 60) driftLevel = "CONCERNING";
  else if (resilience < 80) driftLevel = "NOMINAL";

  return {
    resilience,
    driftLevel,
    breakdown: {
      sleep: Math.round(sleepScore),
      stress: Math.round(stressScore),
      mood: Math.round(moodScore),
      activity: Math.round(activityScore),
      water: Math.round(waterScore),
      healthStatus: Math.round(healthStatusScore),
      symptoms: Math.round(symptomsScore),
      lifestyle: Math.round(lifestyleScore),
    },
  };
}
