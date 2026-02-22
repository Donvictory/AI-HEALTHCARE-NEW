import mongoose, { Schema, Document } from "mongoose";
import { IDoctorEntity, Specialty } from "./doctor.entity";

export interface IDoctor extends Omit<IDoctorEntity, "_id">, Document {}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true },
    email: { type: String, lowercase: true },
    phone: { type: String },
    specialty: {
      type: String,
      enum: Object.values(Specialty),
      required: true,
    },
    hospitalOrClinic: { type: String, required: true },
    bio: { type: String },
    profileImage: { type: String },

    // Location
    state: { type: String, required: true, lowercase: true },
    city: { type: String, required: true, lowercase: true },
    address: { type: String },

    // Profile details
    yearsOfExperience: { type: Number, min: 0 },
    consultationFee: { type: Number, min: 0 },
    rating: { type: Number, min: 0, max: 5 },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Index for fast location-based lookups
DoctorSchema.index({ state: 1, city: 1 });
DoctorSchema.index({ specialty: 1 });

const DoctorModel = mongoose.model<IDoctor>("Doctor", DoctorSchema);
export default DoctorModel;
