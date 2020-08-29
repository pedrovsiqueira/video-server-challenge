import { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface IRoom extends Document {
  name: string;
  guid: string;
  hostUser: string;
  participants: string[];
  capacity: number;
}

const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  guid: {
    type: String,
    required: true,
    default: uuidv4(),
  },
  hostUser: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  capacity: {
    type: Number,
    required: true,
  },
});

const User = model<IRoom>('User', RoomSchema);

export default User;
