import { Specialty } from "./doctor.entity";

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateDoctorDto {
  name: string;
  email?: string;
  phone?: string;
  specialty: Specialty;
  hospitalOrClinic: string;
  bio?: string;
  profileImage?: string;
  state: string;
  city: string;
  address?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  rating?: number;
  isAvailable?: boolean;
}

export type UpdateDoctorDto = Partial<CreateDoctorDto>;

// ─── Query DTO ────────────────────────────────────────────────────────────────

export interface FindDoctorsQuery {
  state?: string;
  city?: string;
  specialty?: Specialty;
  isAvailable?: boolean;
}

// ─── Response DTO ─────────────────────────────────────────────────────────────

export interface DoctorResponseDto extends CreateDoctorDto {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
