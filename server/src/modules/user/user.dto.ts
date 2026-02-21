import {
  UserRole,
  Gender,
  HealthCondition,
  FamilyHealthHistory,
} from "./user.entity";

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UpdateProfileDto {
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  state?: string;
  city?: string;
  phoneNumber?: string;
  healthConditions?: HealthCondition[];
  familyHealthHistory?: FamilyHealthHistory[];
  hasCompletedDailyChecks?: boolean;
  currentDailyCheckStep?: number;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface UserDto {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  state?: string;
  city?: string;
  phoneNumber?: string;
  healthConditions?: HealthCondition[];
  familyHealthHistory?: FamilyHealthHistory[];
  hasCompletedDailyChecks?: boolean;
  currentDailyCheckStep?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}
