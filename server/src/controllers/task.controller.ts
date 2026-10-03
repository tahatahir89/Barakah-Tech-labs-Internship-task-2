import { emitToUser } from '../config/realtime';
import { PRIORITY_RANK, Task } from '../models/Task';
import { buildFilter, getOwnedTask, SORTS } from '../services/task.service';
import { deleteImage } from '../services/upload.service';
import { asyncHandler } from '../utils/asyncHandler';
import { toTask } from '../utils/serializers';
import type { CreateTask, ListQuery, UpdateTask } from '../validators/schemas';

export const createTask = asyncHandler(async (req, res) => {
  const body = req.body as CreateTask;
  const userId = req.user!.id as string;
  const task = await Task.create({
    ...body,
    user: req.user!._id,
    priorityRank: PRIORITY_RANK[body.priority],
    completedAt: body.status === 'Completed' ? new Date() : null,
  });
  await emitToUser(userId, 'task:changed', { id: task.id, type: 'created' });
  res.status(201).json({ task: toTask(task) });
});

export const listTasks = asyncHandler(async (req, res) => {
  const q = res.locals.query as ListQuery;
  const filter = buildFilter(req.user!._id, q);
  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .select('-drawing')
      .sort(SORTS[q.sort])
      .skip((q.page - 1) * q.limit)
      .limit(q.limit),
    Task.countDocuments(filter),
  ]);
  if (q.sort === 'due') {
    // Mongo sorts missing dates first; push tasks without a due date to the end (stable sort keeps createdAt order).
    const t = (d?: Date | null) => (d ? d.getTime() : Number.MAX_SAFE_INTEGER);
    tasks.sort((a, b) => t(a.dueDate) - t(b.dueDate));
  }
  res.json({ tasks: tasks.map((t) => toTask(t, false)), total, page: q.page });
});

export const listCategories = asyncHandler(async (req, res) => {
  const categories = (await Task.distinct('category', { user: req.user!._id })) as string[];
  res.json({ categories: categories.sort((a, b) => a.localeCompare(b)) });
});

export const getTask = asyncHandler(async (req, res) => {
  res.json({ task: toTask(await getOwnedTask(req)) });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req);
  const { status, priority, drawing, ...rest } = req.body as UpdateTask;

  Object.assign(task, rest);
  if (priority) {
    task.priority = priority;
    task.priorityRank = PRIORITY_RANK[priority];
  }
  if (status && status !== task.status) {
    task.status = status;
    task.completedAt = status === 'Completed' ? new Date() : null;
  }
  if (drawing !== undefined) {
    task.drawing = drawing;
    task.markModified('drawing');
  }
  await task.save();

  await emitToUser(req.user!.id, 'task:changed', { id: task.id, type: 'updated' });
  res.json({ task: toTask(task) });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req);
  await Promise.all(task.attachments.map((a) => deleteImage(a.publicId)));
  await task.deleteOne();
  await emitToUser(req.user!.id, 'task:changed', { id: task.id, type: 'deleted' });
  res.json({ message: 'Task deleted' });
});
