import { Types } from 'mongoose';
import { Task } from '../models/Task';
import { asyncHandler } from '../utils/asyncHandler';

const count = (cond: unknown) => ({ $sum: { $cond: [cond, 1, 0] } });

export const getStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const since = new Date(now);
  since.setUTCDate(since.getUTCDate() - 6);
  since.setUTCHours(0, 0, 0, 0);
  const open = { $ne: ['$status', 'Completed'] };

  const [result] = await Task.aggregate([
    { $match: { user: new Types.ObjectId(req.user!.id as string) } },
    {
      $facet: {
        counts: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: count({ $eq: ['$status', 'Completed'] }),
              inProgress: count({ $eq: ['$status', 'In Progress'] }),
              pending: count({ $eq: ['$status', 'Todo'] }),
              highPriority: count({ $and: [{ $gte: ['$priorityRank', 2] }, open] }),
              overdue: count({
                $and: [open, { $eq: [{ $type: '$dueDate' }, 'date'] }, { $lt: ['$dueDate', now] }],
              }),
            },
          },
        ],
        byPriority: [{ $group: { _id: '$priority', count: { $sum: 1 } } }],
        activity: [
          { $match: { completedAt: { $gte: since } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const c = result.counts[0] ?? {};
  const perDay = new Map<string, number>(result.activity.map((a: { _id: string; count: number }) => [a._id, a.count]));
  const activity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    return { date, count: perDay.get(date) ?? 0 };
  });

  res.json({
    total: c.total ?? 0,
    completed: c.completed ?? 0,
    inProgress: c.inProgress ?? 0,
    pending: c.pending ?? 0,
    highPriority: c.highPriority ?? 0,
    overdue: c.overdue ?? 0,
    byPriority: Object.fromEntries(result.byPriority.map((p: { _id: string; count: number }) => [p._id, p.count])),
    activity,
  });
});
