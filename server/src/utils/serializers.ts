import type { TaskDoc } from '../models/Task';
import type { UserDoc } from '../models/User';

const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

/** Ask Cloudinary for automatic format + quality when the image is delivered (smaller files, same look). */
const optimize = (url?: string | null) =>
  url && url.includes('/image/upload/') && !url.includes('/upload/f_auto') ? url.replace('/image/upload/', '/image/upload/f_auto,q_auto/') : url ?? null;

export const effectiveStatus = (u: { status: string; lastActive: Date }) =>
  u.status === 'active' && Date.now() - u.lastActive.getTime() < ACTIVE_WINDOW_MS ? 'active' : 'offline';

/** The only shape in which a user ever leaves the API (never includes the password hash). */
export function toUser(u: UserDoc) {
  return {
    id: u.id as string,
    name: u.name,
    username: u.username,
    email: u.email,
    profileImage: optimize(u.profileImage?.url),
    status: effectiveStatus(u),
    lastActive: u.lastActive,
    createdAt: u.createdAt,
  };
}

export function toTask(t: TaskDoc, withDrawing = true) {
  return {
    id: t.id as string,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    category: t.category,
    dueDate: t.dueDate ?? null,
    completedAt: t.completedAt ?? null,
    attachments: t.attachments.map((a) => ({ id: a.id as string, url: optimize(a.url) ?? a.url, name: a.name, bytes: a.bytes })),
    drawing: withDrawing ? t.drawing ?? null : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}
