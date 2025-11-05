import bcrypt from 'bcryptjs';
import jwt, { SignOptions, Secret} from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from './dbService';

dotenv.config();

export interface JWTPayload {
  id: string;
  org_id: string;
  role: string;
  manager_id?: string;
  first_name?: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: JWTPayload): string => {
  const secret: Secret = (process.env.JWT_SECRET || '') as string;
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as any };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
};

export const getInviteData = async (token: string): Promise<{ invite: any; inviteErr: any }> => {
  const { data, error } = await supabase.from('invites').select('*').eq('token', token).single();
  return { invite: data, inviteErr: error };
};

export const verfyEmail = async (email: string): Promise<{ user: any; error: any }> => {
  const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
  return { user, error };
};