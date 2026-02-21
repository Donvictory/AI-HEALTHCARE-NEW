export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  DOCTOR = "DOCTOR",
  PATIENT = "PATIENT",
  USER = "USER", // Default role
}

export interface IUserEntity {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
