import { Router } from 'express';
import { addAttachment, removeAttachment } from '../controllers/attachment.controller';
import { createTask, deleteTask, getTask, listCategories, listTasks, updateTask } from '../controllers/task.controller';
import { requireAuth } from '../middleware/auth';
import { imageUpload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { createTaskSchema, listQuerySchema, updateTaskSchema } from '../validators/schemas';

const router = Router();
router.use(requireAuth);
router.post('/', validate(createTaskSchema), createTask);
router.get('/', validate(listQuerySchema, 'query'), listTasks);
router.get('/categories', listCategories); // keep above "/:id"
router.get('/:id', getTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/attachments', imageUpload, addAttachment);
router.delete('/:id/attachments/:attachmentId', removeAttachment);
export default router;
