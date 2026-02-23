import {
  IDailyCheckInEntity,
  CurrentHealthStatus,
  Symptom,
  LifestyleCheck,
} from "./daily-check-in.entity";

// ─── Step DTOs (per step of the check-in wizard) ─────────────────────────────

export class SleepAndEnergyDto {
  hoursSlept!: number;
  stressLevel!: number; // 1–10
  currentMood!: number; // 1–10
}

export class MovementAndWaterDto {
  dailyActivityMeasure!: number; // minutes
  numOfWaterGlasses!: number;
}

export class HealthStatusDto {
  currentHealthStatus!: CurrentHealthStatus;
  symptomsToday!: Symptom[];
}

export class MedicalReportsDto {
  medicalReports?: string[];
  feelingAboutReport?: string;
}

export class FinalQuestionsDto {
  lifestyleChecks!: LifestyleCheck[];
  anythingElse?: string;
}

// ─── Full Create / Update DTOs ────────────────────────────────────────────────

export class CreateDailyCheckInDto {
  hoursSlept!: number;
  stressLevel!: number;
  currentMood!: number;
  dailyActivityMeasure!: number;
  numOfWaterGlasses!: number;
  currentHealthStatus!: CurrentHealthStatus;
  symptomsToday!: Symptom[];
  medicalReports?: string[];
  feelingAboutReport?: string;
  lifestyleChecks!: LifestyleCheck[];
  anythingElse?: string;
}

export class UpdateDailyCheckInDto {
  hoursSlept?: number;
  stressLevel?: number;
  currentMood?: number;
  dailyActivityMeasure?: number;
  numOfWaterGlasses?: number;
  currentHealthStatus?: CurrentHealthStatus;
  symptomsToday?: Symptom[];
  medicalReports?: string[];
  feelingAboutReport?: string;
  lifestyleChecks?: LifestyleCheck[];
  anythingElse?: string;
}

// ─── Response DTO ─────────────────────────────────────────────────────────────

export class DailyCheckInResponseDto {
  _id!: string;
  userId!: string;
  hoursSlept!: number;
  stressLevel!: number;
  currentMood!: number;
  dailyActivityMeasure!: number;
  numOfWaterGlasses!: number;
  currentHealthStatus!: CurrentHealthStatus;
  symptomsToday!: Symptom[];
  medicalReports?: string[];
  feelingAboutReport?: string;
  lifestyleChecks!: LifestyleCheck[];
  anythingElse?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
