export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
  USER = "USER", // Default role
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum HealthCondition {
  NONE = "NONE",
  HYPERTENSION = "HYPERTENSION",
  DIABETES = "DIABETES",
  ASTHMA = "ASTHMA",
  HEART_DISEASE = "HEART DISEASE",
  MALARIA = "MALARIA",
  SICKLE_CELL = "SICKLE CELL",
}

export enum FamilyHealthHistory {
  NONE = "NONE",
  HYPERTENSION = "HYPERTENSION",
  DIABETES = "DIABETES",
  ASTHMA = "ASTHMA",
  HEART_DISEASE = "HEART DISEASE",
  MALARIA = "MALARIA",
  SICKLE_CELL = "SICKLE CELL",
}

export interface IUserEntity {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;

  // Onboarding fields
  age?: number;
  gender?: Gender;
  height?: number; // cm
  weight?: number; // kg
  state?: string;
  city?: string;
  phoneNumber?: string;
  healthConditions?: HealthCondition[];
  familyHealthHistory?: FamilyHealthHistory[];
  hasCompletedDailyChecks?: boolean;
  currentDailyCheckStep?: number;
  healthPoints?: number; // accumulated from check-ins
  isFirstLogin?: boolean; // true until first completed onboarding

  createdAt?: Date;
  updatedAt?: Date;
}
