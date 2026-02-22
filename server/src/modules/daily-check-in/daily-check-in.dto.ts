import {
  IDailyCheckInEntity,
  CurrentHealthStatus,
  Symptom,
  LifestyleCheck,
} from "./daily-check-in.entity";

// ─── Step DTOs (per step of the check-in wizard) ─────────────────────────────

export interface SleepAndEnergyDto {
  hoursSlept: number;
  stressLevel: number; // 1–10
  currentMood: number; // 1–10
}

export interface MovementAndWaterDto {
  dailyActivityMeasure: number; // minutes
  numOfWaterGlasses: number;
}

export interface HealthStatusDto {
  currentHealthStatus: CurrentHealthStatus;
  symptomsToday: Symptom[];
}

export interface MedicalReportsDto {
  medicalReports?: string[];
  feelingAboutReport?: string;
}

export interface FinalQuestionsDto {
  lifestyleChecks: LifestyleCheck[];
  anythingElse?: string;
}

// ─── Full Create / Update DTOs ────────────────────────────────────────────────

export type CreateDailyCheckInDto = Omit<
  IDailyCheckInEntity,
  "_id" | "userId" | "createdAt" | "updatedAt"
>;

export type UpdateDailyCheckInDto = Partial<CreateDailyCheckInDto>;

// ─── Response DTO ─────────────────────────────────────────────────────────────

export interface DailyCheckInResponseDto extends IDailyCheckInEntity {
  _id: string;
}
