import { Router } from 'express';
import { changePassword, getMe, heartbeat, removeAvatar, updateMe, uploadAvatar } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';
import { imageUpload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../validators/schemas';

const router = Router();
router.use(requireAuth);
router.get('/me', getMe);
router.patch('/me', validate(updateProfileSchema), updateMe);
router.patch('/me/password', validate(changePasswordSchema), changePassword);
router.post('/me/avatar', imageUpload, uploadAvatar);
router.delete('/me/avatar', removeAvatar);
router.post('/me/heartbeat', heartbeat);
export default router;
