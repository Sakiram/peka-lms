import { supabase } from './dbService';
import { AppError } from '../utils/AppError';
import { User } from '../types/user';

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

export const getOrgName = async(organization_id: string) => await supabase.from('organizations').select('org_name').eq('id', organization_id).single();

export const addUser = async (data: User): Promise<any> => {
  const { data:user, error } = await supabase.from('users').insert([
    {
      id: data.id,
      organization_id: data.org_id,
      email: data.email,
      password_hash: data.password,
      first_name: data?.first_name,
      last_name: data?.last_name,
      username: data.username,
      role: data.role,
      manager_id: data.manager_id,
      status: data.status,
      join_date: data.created_at,
      created_at: data.created_at,
      updated_at: data.created_at,
      created_by: data.created_by,
    },
  ]);
  if (error || !data) throw new AppError(error?.message || "Error on insert", 400);
  return user;
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
