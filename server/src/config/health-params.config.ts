import {
  CurrentHealthStatus,
  Symptom,
  LifestyleCheck,
} from "../modules/daily-check-in/daily-check-in.entity";

export const NOMINAL_HEALTH_PARAMS = {
  hoursSlept: 8,
  stressLevel: 3, // out of 10 (lower is better)
  currentMood: 7, // out of 10 (higher is better)
  dailyActivityMeasure: 60, // minutes
  numOfWaterGlasses: 8,
};

export const scoringLogic = {
  hoursSlept: (h: number) => {
    // 8h is optimal. Each hour diff is ~12.5% penalty.
    const diff = Math.abs(h - NOMINAL_HEALTH_PARAMS.hoursSlept);
    const score = 100 - diff * 12.5;
    return Math.max(0, Math.min(100, score));
  },
  stressLevel: (s: number) => {
    // 1-10. 1 is best, 10 is worst.
    // Score = (11 - s) / 10 * 100? No, let's keep it simple: 100 - (s-1)*11
    const score = 100 - (s - 1) * 11.1;
    return Math.max(0, score);
  },
  currentMood: (m: number) => {
    // 1-10. 10 is best.
    const score = (m / 10) * 100;
    return Math.max(0, score);
  },
  dailyActivity: (mins: number) => {
    const score = (mins / NOMINAL_HEALTH_PARAMS.dailyActivityMeasure) * 100;
    return Math.min(100, score);
  },
  water: (glasses: number) => {
    const score = (glasses / NOMINAL_HEALTH_PARAMS.numOfWaterGlasses) * 100;
    return Math.min(100, score);
  },
  healthStatus: (status: CurrentHealthStatus) => {
    switch (status) {
      case CurrentHealthStatus.EXCELLENT:
        return 100;
      case CurrentHealthStatus.GOOD:
        return 80;
      case CurrentHealthStatus.FAIR:
        return 50;
      default:
        return 30; // Poor not in enum but fallback
    }
  },
  symptoms: (symptoms: Symptom[]) => {
    // 20% penalty per symptom
    const penalty = symptoms.length * 20;
    return Math.max(0, 100 - penalty);
  },
  lifestyle: (checks: LifestyleCheck[]) => {
    // 25% penalty per bad lifestyle check
    const penalty = checks.length * 25;
    return Math.max(0, 100 - penalty);
  },
};
