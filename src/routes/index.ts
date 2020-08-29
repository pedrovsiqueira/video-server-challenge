import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './users.routes';
import roomsRoutes from './rooms.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/rooms', roomsRoutes);

export default router;
