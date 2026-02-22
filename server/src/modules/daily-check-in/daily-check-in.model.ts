import mongoose, { Schema, Document } from "mongoose";
import {
  IDailyCheckInEntity,
  CurrentHealthStatus,
  Symptom,
  LifestyleCheck,
} from "./daily-check-in.entity";

export interface IDailyCheckIn
  extends Omit<IDailyCheckInEntity, "_id">, Document {}

const DailyCheckInSchema = new Schema<IDailyCheckIn>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },

    // Step 1: Sleep & Energy
    hoursSlept: { type: Number, required: true, min: 0, max: 24 },
    stressLevel: { type: Number, required: true, min: 1, max: 10 },
    currentMood: { type: Number, required: true, min: 1, max: 10 },

    // Step 2: Movement & Water
    dailyActivityMeasure: { type: Number, required: true, min: 0 },
    numOfWaterGlasses: { type: Number, required: true, min: 0 },

    // Step 3: Health Status
    currentHealthStatus: {
      type: String,
      enum: Object.values(CurrentHealthStatus),
      required: true,
    },
    symptomsToday: [
      {
        type: String,
        enum: Object.values(Symptom),
      },
    ],

    // Step 4: Medical Reports (optional)
    medicalReports: [{ type: String }],
    feelingAboutReport: { type: String },

    // Step 5: Final Questions
    lifestyleChecks: [
      {
        type: String,
        enum: Object.values(LifestyleCheck),
      },
    ],
    anythingElse: { type: String },
  },
  { timestamps: true },
);

// One check-in per user per day
DailyCheckInSchema.index({ userId: 1, createdAt: 1 });

const DailyCheckInModel = mongoose.model<IDailyCheckIn>(
  "DailyCheckIn",
  DailyCheckInSchema,
);
export default DailyCheckInModel;
