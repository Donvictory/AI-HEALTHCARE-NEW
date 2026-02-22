import mongoose, { Schema, Document } from "mongoose";
import { ITaskEntity } from "./task.entity";

export interface ITask extends Omit<ITaskEntity, "_id">, Document {}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Helpful index to fast query tasks for a specific user and today
TaskSchema.index({ userId: 1, createdAt: -1 });

const TaskModel = mongoose.model<ITask>("Task", TaskSchema);
export default TaskModel;
