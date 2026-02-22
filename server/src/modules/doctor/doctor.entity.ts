// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Specialty {
  GENERAL_PRACTITIONER = "GENERAL_PRACTITIONER",
  CARDIOLOGIST = "CARDIOLOGIST",
  DERMATOLOGIST = "DERMATOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  GASTROENTEROLOGIST = "GASTROENTEROLOGIST",
  NEUROLOGIST = "NEUROLOGIST",
  OBSTETRICIAN_GYNECOLOGIST = "OBSTETRICIAN_GYNECOLOGIST",
  ONCOLOGIST = "ONCOLOGIST",
  OPHTHALMOLOGIST = "OPHTHALMOLOGIST",
  ORTHOPEDIC_SURGEON = "ORTHOPEDIC_SURGEON",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  PULMONOLOGIST = "PULMONOLOGIST",
  RADIOLOGIST = "RADIOLOGIST",
  RHEUMATOLOGIST = "RHEUMATOLOGIST",
  UROLOGIST = "UROLOGIST",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  DENTIST = "DENTIST",
  NUTRITIONIST = "NUTRITIONIST",
  PHYSICAL_THERAPIST = "PHYSICAL_THERAPIST",
  OTHER = "OTHER",
}

// ─── Entity Interface ─────────────────────────────────────────────────────────

export interface IDoctorEntity {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  specialty: Specialty;
  hospitalOrClinic: string;
  bio?: string;
  profileImage?: string;

  // Location
  state: string;
  city: string;
  address?: string;

  // Profile
  yearsOfExperience?: number;
  consultationFee?: number; // in local currency
  rating?: number; // 0–5, computed or manually set
  isAvailable: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
