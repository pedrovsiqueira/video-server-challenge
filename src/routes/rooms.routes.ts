import { Router } from 'express';
import RoomsController from '../controllers/roomController';
import authenticate from '../middlewares/authentication';

const router = Router();
const roomsController = new RoomsController();

router.post('/', authenticate, roomsController.create);

export default router;
