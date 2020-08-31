import { Request, Response } from 'express';
import Room from '../models/Room';
import User from '../models/User';

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
      const responseFromDb = await new Room(newRoom).save();
      return response.status(201).json(responseFromDb);
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Request failed, please try again' });
    }
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { roomId } = request.params;
    const { newHostId } = request.body;

    try {
      const currentRoomHost = await Room.findById(roomId, {
        hostUser: 1,
        _id: 0,
      });

      if (!currentRoomHost) {
        return response.status(400).json({ message: 'The room was not found' });
      }

      if (id !== currentRoomHost.hostUser.toString()) {
        return response
          .status(403)
          .json({ message: 'The current user is not the host of the room' });
      }

      const updatedRoomHost = {
        hostUser: newHostId,
      };

      const responseFromDb = await Room.findByIdAndUpdate(
        roomId,
        updatedRoomHost,
        {
          new: true,
        },
      );

      return response.status(200).json(responseFromDb);
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Request failed, please try again' });
    }
  }

  public async toggleIO(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id } = request.user;
    const { roomId } = request.params;

    try {
      const room = await Room.findById(roomId, {
        participants: 1,
        capacity: 1,
        _id: 0,
      });

      if (!room) {
        return response.status(400).json({ message: 'The room was not found' });
      }

      const isUserInRoom = room.participants.find(user => {
        return id === user.toString();
      });

      if (isUserInRoom) {
        const updatedRoom = await Room.findByIdAndUpdate(
          roomId,
          {
            $pull: {
              participants: id,
            },
          },
          { new: true },
        );
        return response.status(200).json(updatedRoom);
      }

      if (room.capacity === room.participants.length) {
        return response.status(400).json({
          message:
            "Request failed, numnber of participants can't be larger than the capacity",
        });
      }

      const updatedRoom = await Room.findByIdAndUpdate(
        roomId,
        {
          $push: {
            participants: id,
          },
        },
        { new: true },
      );

      return response.status(200).json(updatedRoom);
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Request failed, please try again' });
    }
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { guid } = request.params;

    try {
      const room = await Room.findOne({ guid });

      if (!room) {
        return response.status(400).json({
          message: 'No room found',
        });
      }

      return response.status(200).json(room);
    } catch (error) {
      return response.status(500).json({
        message: 'Request failed, please try again',
      });
    }
  }

  public async listRoomsByParticipant(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { username } = request.params;

    try {
      const user = await User.findOne(
        { username },
        {
          _id: 1,
        },
      );

      if (!user) {
        return response.status(400).json({ message: 'Username not found' });
      }

      const rooms = await Room.find({
        participants: { $elemMatch: { $eq: user._id } },
      });

      if (rooms.length === 0) {
        return response.status(400).json({
          message: 'No rooms found',
        });
      }

      return response.status(200).json(rooms);
    } catch (error) {
      return response.status(500).json({
        message: 'Request failed, please try again',
      });
    }
  }
}
