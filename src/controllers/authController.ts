import { comparePassword, generateToken, hashPassword, getInviteData, verfyEmail } from '../services/authService'
import { getCurrentTime } from '../middleware/commonMiddleware';
import { updateUser } from '../services/userService';
import { updateInvite } from '../services/inviteService';
import { AppError } from "../utils/AppError";
import { Request, Response } from "express";

export const login = async (req: Request, res:Response) => {
  const { email, password } = req.body;
  const { user, error } = await verfyEmail(email);
  if (error || !user) throw new AppError('Invalid Email ID', 400)

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new AppError('Invalid Password', 400)

  const token = generateToken({ id: user.id, org_id: user.organization_id, role: user.role, manager_id: user.manager_id, first_name: user.first_name });
  res.json({ token, user: user });
};

export const setPassword = async (req: Request, res: Response) => {
  const { password, firstName, lastName, userName } = req.body;
  const token = req.query.token as string;

  const { invite, inviteErr } = await getInviteData(token);
  if (!invite || inviteErr) throw new AppError('Invalid token', 400);

  const password_hash = await hashPassword(password);
  const now = getCurrentTime();
  const updateErr = await updateUser(password_hash, firstName, lastName, userName, now, invite);
  const updateInviteErr = await updateInvite(invite);
  const error = inviteErr || updateErr || updateInviteErr;
  if (error) throw new AppError( error.message, 400);
  res.json({ message: 'Password set successfully' });
};
