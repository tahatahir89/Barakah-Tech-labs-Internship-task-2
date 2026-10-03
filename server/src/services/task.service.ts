import type { Request } from 'express';
import type { FilterQuery, Types } from 'mongoose';
import { ITask, Task } from '../models/Task';
import type { ListQuery } from '../validators/schemas';
import { AppError } from '../utils/AppError';
import { assertObjectId } from '../utils/objectId';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  due: { dueDate: 1, createdAt: -1 },
  priority: { priorityRank: -1, createdAt: -1 },
} as const;

export function buildFilter(userId: Types.ObjectId, q: ListQuery): FilterQuery<ITask> {
  const filter: FilterQuery<ITask> = { user: userId };
  const and: FilterQuery<ITask>[] = [];

  if (q.status) filter.status = q.status;
  if (q.priority) filter.priority = q.priority;
  if (q.category) filter.category = q.category;
  if (q.q) {
    const re = new RegExp(escapeRegex(q.q), 'i');
    and.push({ $or: [{ title: re }, { description: re }] });
  }
  if (q.overdue) {
    and.push({ dueDate: { $lt: new Date() } });
    if (!q.status) filter.status = { $ne: 'Completed' };
  } else if (q.noDue) {
    and.push({ dueDate: null });
  } else if (q.dueFrom || q.dueTo) {
    and.push({ dueDate: { ...(q.dueFrom ? { $gte: q.dueFrom } : {}), ...(q.dueTo ? { $lte: q.dueTo } : {}) } });
  }
  if (and.length) filter.$and = and;
  return filter;
}

/** Ownership is enforced here: a task is only ever loaded by { _id, user }. Others' tasks look like 404s. */
export async function getOwnedTask(req: Request) {
  const { id } = req.params;
  assertObjectId(id);
  const task = await Task.findOne({ _id: id, user: req.user!._id });
  if (!task) throw new AppError(404, 'Task not found.');
  return task;
}
