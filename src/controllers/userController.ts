import { supabase } from '../services/dbService';
import { getErrorMessage } from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';

export const addUser = async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, role, manager_id } = req.body;

    const { data, error } = await supabase.from('users').insert([{
      email,
      first_name,
      last_name,
      role,
      manager_id,
      created_by: req.user.id
    }]);
    if (error || !data) return res.status(400).json({ error });

    return res.status(201).json({ user: data[0] });
  } catch (err) {
    return res.status(500).json({ error: getErrorMessage(err) });
  }
};
