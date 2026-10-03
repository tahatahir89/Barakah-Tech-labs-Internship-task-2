import { emitToUser } from '../config/realtime';
import { getOwnedTask } from '../services/task.service';
import { deleteImage, uploadImage } from '../services/upload.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { assertObjectId } from '../utils/objectId';
import { toTask } from '../utils/serializers';

const MAX_ATTACHMENTS = 8;

export const addAttachment = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req);
  if (!req.file) throw new AppError(400, 'Choose an image to upload.');
  if (task.attachments.length >= MAX_ATTACHMENTS) {
    throw new AppError(400, `A task can have up to ${MAX_ATTACHMENTS} images.`);
  }

  const result = await uploadImage(req.file.buffer, `${req.user!.id}/tasks`);
  task.attachments.push({
    url: result.secure_url,
    publicId: result.public_id,
    name: req.file.originalname.slice(0, 200),
    bytes: result.bytes,
  });
  await task.save();

  await emitToUser(req.user!.id, 'task:changed', { id: task.id, type: 'updated' });
  res.status(201).json({ task: toTask(task) });
});

export const removeAttachment = asyncHandler(async (req, res) => {
  const task = await getOwnedTask(req);
  const { attachmentId } = req.params;
  assertObjectId(attachmentId, 'Attachment');
  const attachment = task.attachments.id(attachmentId);
  if (!attachment) throw new AppError(404, 'Attachment not found.');

  await deleteImage(attachment.publicId);
  task.attachments.pull({ _id: attachmentId });
  await task.save();

  await emitToUser(req.user!.id, 'task:changed', { id: task.id, type: 'updated' });
  res.json({ task: toTask(task) });
});
