import { Request, Response } from 'express';
import Room from '../models/Room';

interface INewRoom {
  name: string;
  hostUser: string;
  capacity?: number;
}

export default class RoomController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, capacity } = request.body;

    if (!name) {
      return response.status(400).json({
        message: `Missing name field`,
      });
    }

    const newRoom: INewRoom = {
      name,
      hostUser: request.user.id,
    };

    if (capacity) {
      newRoom.capacity = capacity;
    }

    try {
      const responseFromDb = await Room.create(newRoom);
      return response.status(201).json(responseFromDb);
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Request failed, please try again' });
    }
  }
}
