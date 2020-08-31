import { Router } from 'express';
import RoomsController from '../controllers/roomController';
import authenticate from '../middlewares/authentication';

const router = Router();
const roomsController = new RoomsController();

router.post('/', authenticate, roomsController.create);
router.put('/host/:roomId', authenticate, roomsController.update);
router.put('/alternate/:roomId', authenticate, roomsController.toggleIO);
router.get('/:guid', roomsController.show);
router.get('/user/:username', roomsController.listRoomsByParticipant);

export default router;
