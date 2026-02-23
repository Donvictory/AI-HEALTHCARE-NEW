import { Specialty } from "./doctor.entity";

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class CreateDoctorDto {
  name!: string;
  email?: string;
  phone?: string;
  specialty!: Specialty;
  hospitalOrClinic!: string;
  bio?: string;
  profileImage?: string;
  state!: string;
  city!: string;
  address?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  rating?: number;
  isAvailable?: boolean;
}

export class UpdateDoctorDto {
  name?: string;
  email?: string;
  phone?: string;
  specialty?: Specialty;
  hospitalOrClinic?: string;
  bio?: string;
  profileImage?: string;
  state?: string;
  city?: string;
  address?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  rating?: number;
  isAvailable?: boolean;
}

// ─── Query DTO ────────────────────────────────────────────────────────────────

export class FindDoctorsQuery {
  state?: string;
  city?: string;
  specialty?: Specialty;
  isAvailable?: boolean;
}

// ─── Response DTO ─────────────────────────────────────────────────────────────

export class DoctorResponseDto {
  _id!: string;
  name!: string;
  email?: string;
  phone?: string;
  specialty!: Specialty;
  hospitalOrClinic!: string;
  bio?: string;
  profileImage?: string;
  state!: string;
  city!: string;
  address?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  rating?: number;
  isAvailable?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
