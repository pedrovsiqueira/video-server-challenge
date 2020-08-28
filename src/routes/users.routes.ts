import { Router } from 'express';
import UsersController from '../controllers/userController';

const router = Router();
const usersController = new UsersController();

router.post('/', usersController.create);

export default router;
