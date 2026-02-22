// ─── Enums ───────────────────────────────────────────────────────────────────

export enum CurrentHealthStatus {
  EXCELLENT = "EXCELLENT",
  GOOD = "GOOD",
  FAIR = "FAIR",
}

export enum Symptom {
  FEVER = "FEVER",
  HEADACHE = "HEADACHE",
  FATIGUE = "FATIGUE",
  COUGH = "COUGH",
  SORE_THROAT = "SORE_THROAT",
  SHORTNESS_OF_BREATH = "SHORTNESS_OF_BREATH",
  BODY_ACHES = "BODY_ACHES",
  NAUSEA = "NAUSEA",
  VOMITING = "VOMITING",
  DIZZINESS = "DIZZINESS",
  RASH = "RASH",
  CHEST_PAIN = "CHEST_PAIN",
  ABDOMINAL_PAIN = "ABDOMINAL_PAIN",
  LOSS_OF_APPETITE = "LOSS_OF_APPETITE",
  INSOMNIA = "INSOMNIA",
  ANXIETY = "ANXIETY",
  DEPRESSION = "DEPRESSION",
  JOINT_PAIN = "JOINT_PAIN",
  BACK_PAIN = "BACK_PAIN",
  OTHER = "OTHER",
}

export enum LifestyleCheck {
  DRANK_LAST_NIGHT = "DRANK_LAST_NIGHT",
  SMOKED_TODAY = "SMOKED_TODAY",
  SKIPPED_MEALS = "SKIPPED_MEALS",
  NO_EXERCISE = "NO_EXERCISE",
}

// ─── Entity Interface ─────────────────────────────────────────────────────────

export interface IDailyCheckInEntity {
  _id?: string;
  userId: string;

  // Step 1: Sleep & Energy
  hoursSlept: number;
  stressLevel: number; // 1–10
  currentMood: number; // 1–10

  // Step 2: Movement & Water
  dailyActivityMeasure: number; // minutes
  numOfWaterGlasses: number;

  // Step 3: Health Status
  currentHealthStatus: CurrentHealthStatus;
  symptomsToday: Symptom[];

  // Step 4: Medical Reports (optional)
  medicalReports?: string[];
  feelingAboutReport?: string; // open-ended, normalized by LLM

  // Step 5: Final Questions
  lifestyleChecks: LifestyleCheck[];
  anythingElse?: string; // open-ended, normalized by LLM

  createdAt?: Date;
  updatedAt?: Date;
}
