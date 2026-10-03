import { z } from 'zod';
import { PRIORITIES, STATUSES } from '../models/Task';

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

const name = z.string().trim().min(2, 'Enter your full name').max(60);
const username = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,24}$/, 'Use 3-24 letters, numbers or underscores');
const email = z.string().trim().toLowerCase().email('Enter a valid email address');

export const registerSchema = z
  .object({ name, username, email, password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password') });

export const updateProfileSchema = z.object({ name, username, email }).partial();

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, 'Enter your current password'), newPassword: password, confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const stroke = z.object({
  tool: z.enum(['pencil', 'pen', 'eraser']),
  color: z.string().max(20),
  size: z.number().min(1).max(60),
  points: z.array(z.tuple([z.number(), z.number()])).min(1).max(3000),
});
const drawing = z.object({ width: z.number(), height: z.number(), strokes: z.array(stroke).max(400) });

const taskBody = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(2000).default(''),
  priority: z.enum(PRIORITIES).default('Medium'),
  status: z.enum(STATUSES).default('Todo'),
  category: z.string().trim().min(1).max(40).default('General'),
  dueDate: z.coerce.date().nullable().optional(),
  drawing: drawing.nullable().optional(),
});

export const createTaskSchema = taskBody;
export const updateTaskSchema = taskBody.partial();

export const listQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.string().trim().max(40).optional(),
  dueFrom: z.coerce.date().optional(),
  dueTo: z.coerce.date().optional(),
  overdue: z.enum(['1']).optional(),
  noDue: z.enum(['1']).optional(),
  sort: z.enum(['newest', 'oldest', 'due', 'priority']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
});

export type CreateTask = z.infer<typeof createTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
