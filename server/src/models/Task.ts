import { HydratedDocument, Schema, Types, model } from 'mongoose';

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
export const STATUSES = ['Todo', 'In Progress', 'Completed'] as const;
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];
export const PRIORITY_RANK: Record<Priority, number> = { Low: 0, Medium: 1, High: 2, Urgent: 3 };

export interface IAttachment {
  url: string;
  publicId: string;
  name?: string;
  bytes?: number;
}

export interface ITask {
  user: Types.ObjectId;
  title: string;
  description: string;
  priority: Priority;
  priorityRank: number;
  status: Status;
  category: string;
  dueDate?: Date | null;
  completedAt?: Date | null;
  attachments: Types.DocumentArray<IAttachment>;
  drawing?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  name: { type: String, maxlength: 200 },
  bytes: Number,
});

const taskSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    priorityRank: { type: Number, default: 1 },
    status: { type: String, enum: STATUSES, default: 'Todo' },
    category: { type: String, trim: true, maxlength: 40, default: 'General' },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    attachments: { type: [attachmentSchema], default: [] },
    drawing: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
);

// Cover the common queries: newest-first lists, status/due filters, category filter, priority sort.
taskSchema.index({ user: 1, createdAt: -1 });
taskSchema.index({ user: 1, status: 1, dueDate: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ user: 1, priorityRank: -1 });

export type TaskDoc = HydratedDocument<ITask>;
export const Task = model<ITask>('Task', taskSchema);
