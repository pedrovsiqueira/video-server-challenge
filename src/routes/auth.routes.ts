import { Router } from 'express';
import UsersController from '../controllers/userController';

const router = Router();
const usersController = new UsersController();

router.post('/signup', usersController.create);
router.post('/login', usersController.login);

export default router;
