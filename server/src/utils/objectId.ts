import { isValidObjectId } from 'mongoose';
import { AppError } from './AppError';

export function assertObjectId(id: string, label = 'Task') {
  if (!isValidObjectId(id)) throw new AppError(404, `${label} not found.`);
}
