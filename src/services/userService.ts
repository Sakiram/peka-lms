import { supabase } from './dbService';
import { AppError } from '../utils/AppError';

export const checkDuplicateUser = async (org_id: string, email: string): Promise<any> => {
  const { data: existingUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', org_id)
    .eq('email', email)
    .maybeSingle();
  if (error) throw new AppError(error.message, 400);
  return existingUser;
};

export const addUser = async (
  userId: string,
  orgId: string,
  email: string,
  hashedPassword: string | null,
  firstname: string | null,
  lastname: string | null,
  username: string | null,
  manager_id: string | null,
  status: string,
  role: string,
  now: string
): Promise<any> => {
  const { error } = await supabase.from('users').insert([
    {
      id: userId,
      organization_id: orgId,
      email,
      password_hash: hashedPassword,
      first_name: firstname,
      last_name: lastname,
      username,
      role,
      manager_id,
      status,
      join_date: now,
      created_at: now,
      updated_at: now,
      created_by: userId,
    },
  ]);
  return error;
};

export const updateUser = async (
  password_hash: string,
  firstName: string,
  lastName: string,
  userName: string,
  now: string,
  invite: { email: string; organization_id: string }
): Promise<any> => {
  const { error } = await supabase
    .from('users')
    .update({
      password_hash,
      status: 'ACTIVE',
      first_name: firstName,
      last_name: lastName,
      username: userName,
      updated_at: now,
    })
    .eq('email', invite.email)
    .eq('organization_id', invite.organization_id);
  return error;
};