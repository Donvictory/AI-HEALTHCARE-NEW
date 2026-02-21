import mongoose, { Schema, Document } from "mongoose";
import { IUserEntity, UserRole } from "./user.entity";
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
  },
  { timestamps: true },
);

// Hash password before saving
UserSchema.pre("save", async function (next: any) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password as string, 12);
  next();
});

// Instance method to check password
UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
