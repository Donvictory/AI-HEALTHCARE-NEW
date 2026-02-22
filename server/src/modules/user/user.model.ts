import mongoose, { Schema, Document } from "mongoose";
import {
  IUserEntity,
  UserRole,
  Gender,
  HealthCondition,
  FamilyHealthHistory,
} from "./user.entity";
import bcrypt from "bcrypt";

export interface IUser extends Omit<IUserEntity, "_id">, Document {}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isActive: { type: Boolean, default: true },

    // Onboarding fields
    age: { type: Number },
    gender: {
      type: String,
      enum: Object.values(Gender),
    },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    state: { type: String },
    city: { type: String },
    phoneNumber: { type: String },
    healthConditions: [
      {
        type: String,
        enum: Object.values(HealthCondition),
      },
    ],
    familyHealthHistory: [
      {
        type: String,
        enum: Object.values(FamilyHealthHistory),
      },
    ],
    hasCompletedDailyChecks: { type: Boolean, default: false },
    currentDailyCheckStep: { type: Number, default: 1 },
    healthPoints: { type: Number, default: 0 },
    isFirstLogin: { type: Boolean, default: true },
    isOnboarded: { type: Boolean, default: false },
    pushSubscription: {
      endpoint: { type: String },
      expirationTime: { type: Number },
      keys: {
        p256dh: { type: String },
        auth: { type: String },
      },
    },
  },
  { timestamps: true },
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password as string, 12);
});

// Instance method to check password
UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
