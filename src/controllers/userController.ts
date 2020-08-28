import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { credentialsFields } from '../utils/requiredFields';
import User from '../models/User';
import { genToken } from '../utils/tokenGenerator';

interface IUpdatedUser {
  password?: string;
  mobileToken?: string;
}

export default class UserController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { username, password } = request.body;

    const mobileToken = crypto.randomBytes(64).toString('hex');

    for (const field of credentialsFields) {
      if (!request.body[field]) {
        return response.status(400).json({
          message: `Missing ${field} field`,
        });
      }

      if (typeof request.body[field] !== 'string') {
        return response.status(400).json({
          message: `${field} must be a string`,
        });
      }
    }

    if (password.length <= 5) {
      return response.status(400).json({
        message: 'Password must be at least 6 digits',
      });
    }

    try {
      const verifyExistingUser = await User.findOne({ username });

      if (verifyExistingUser) {
        return response
          .status(400)
          .json({ message: 'User already registered' });
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const newUser = {
        username,
        password: hash,
        mobileToken,
      };

      const responseFromDb = await User.create(newUser);

      return response
        .status(201)
        .json({ accessToken: genToken(responseFromDb) });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ message: 'Failed to register user' });
    }
  }

  public async login(request: Request, response: Response): Promise<Response> {
    const { username, password } = request.body;

    for (const field of credentialsFields) {
      if (!request.body[field]) {
        return response.status(400).json({
          message: `Missing ${field} field`,
        });
      }
    }

    try {
      const user = await User.findOne({ username });

      if (!user) {
        return response.status(400).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return response.status(400).json({ message: 'Senha inválida' });
      }

      return response.status(200).json({
        token: genToken(user),
      });
    } catch (error) {
      return response.status(500).json({ message: 'Failed to login' });
    }
  }

  public async index(request: Request, response: Response): Promise<Response> {
    try {
      const users = await User.find({}).select('-password');

      if (users.length === 0) {
        return response.status(400).json({
          message: 'No users found',
        });
      }

      return response.status(200).json(users);
    } catch (error) {
      return response.status(500).json({
        message: 'Request failed, please try again',
      });
    }
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { username } = request.params;

    try {
      const user = await User.findOne({ username }).select('-password');

      if (!user) {
        return response.status(400).json({
          message: 'No user found',
        });
      }

      return response.status(200).json(user);
    } catch (error) {
      return response.status(500).json({
        message: 'Request failed, please try again',
      });
    }
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const { password, mobileToken } = request.body;

    const updateUser = {} as IUpdatedUser;

    if (!password && !mobileToken) {
      return response
        .status(200)
        .json({ message: 'Missing inputs, please try again' });
    }

    if (password) {
      if (password.length <= 5) {
        return response
          .status(200)
          .json({ message: 'Password must be at least 6 digits' });
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        updateUser.password = hash;
      } catch (error) {
        return response.status(500).json({
          message: 'Failed to encrypt password, please try again',
        });
      }
    }

    if (mobileToken) {
      if (mobileToken.length <= 5) {
        return response
          .status(200)
          .json({ message: 'Mobile Token must be at least 6 digits' });
      }

      updateUser.mobileToken = mobileToken;
    }

    try {
      const userToBeUpdated = await User.findById(id);

      if (!userToBeUpdated) {
        return response.status(400).json({
          message: 'No user found',
        });
      }

      const isMatch = await bcrypt.compare(password, userToBeUpdated.password);

      if (isMatch) {
        return response
          .status(400)
          .json({ message: 'Password already in use' });
      }

      const user = await User.findByIdAndUpdate(id, updateUser, { new: true });

      return response.status(200).json(user);
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Request failed, please try again' });
    }
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    try {
      const user = await User.findByIdAndDelete(id);

      if (!user) {
        return response.status(400).json({
          message: 'No user found',
        });
      }

      return response
        .status(200)
        .json({ message: 'User removed successfully' });
    } catch (error) {
      return response.status(500).json({
        message: 'Request failed, please try again',
      });
    }
  }
}
