import {
  UserRole,
  Gender,
  HealthCondition,
  FamilyHealthHistory,
} from "./user.entity";

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class RegisterDto {
  name!: string;
  email!: string;
  password!: string;
  role?: UserRole;
}

export class LoginDto {
  email!: string;
  password!: string;
}

export class RefreshTokenDto {
  refreshToken!: string;
}

export class UpdateProfileDto {
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
  isFirstLogin?: boolean;
}

export class OnboardUserDto {
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  state?: string;
  city?: string;
  phoneNumber?: string;
  healthConditions?: HealthCondition[];
  familyHealthHistory?: FamilyHealthHistory[];
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class UserDto {
  _id!: string;
  name!: string;
  email!: string;
  role!: UserRole;
  isActive!: boolean;
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
  isFirstLogin?: boolean;
  isOnboarded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: UserDto;
}
