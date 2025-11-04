import { addUser } from '../services/userService';
import { getErrorMessage } from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';

export const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const user = await addUser(data);
    res.status(201).json({ user: user[0] })
  } catch (err) {
    return res.status(500).json({ error: getErrorMessage(err) });
  }
};
