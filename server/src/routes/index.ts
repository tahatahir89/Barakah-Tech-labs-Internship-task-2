import { Router } from 'express';
import { getStats } from '../controllers/dashboard.controller';
import { authorizeChannel } from '../controllers/realtime.controller';
import { requireAuth } from '../middleware/auth';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import userRoutes from './user.routes';

const router = Router();
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.get('/dashboard/stats', requireAuth, getStats);
router.post('/realtime/auth', requireAuth, authorizeChannel);
export default router;
