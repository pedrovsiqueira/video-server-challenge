import { Router } from 'express';
import UsersController from '../controllers/userController';
import authenticate from '../middlewares/authentication';

const router = Router();
const usersController = new UsersController();

router.get('/', usersController.index);
router.get('/:username', usersController.show);
router.put('/', authenticate, usersController.update);
router.delete('/', authenticate, usersController.delete);

export default router;
