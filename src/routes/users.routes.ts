import { Router } from 'express';
import UsersController from '../controllers/userController';

const router = Router();
const usersController = new UsersController();

router.get('/', usersController.index);
router.get('/:id', usersController.show);
router.put('/:id', usersController.update);

export default router;
