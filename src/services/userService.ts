import { supabase } from './dbService';
import { AppError } from '../utils/AppError';
import { User } from '../types/userTypes';
import { deleteProfilePicture } from './storageService';

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

export const updateProfile = async (orgId: string, userId: string, updates: any) => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: now })
    .eq('id', userId)
    .eq('organization_id', orgId)
    .select()
    .single();

  if (error) throw new AppError(error.message, 400);
  return data;
};


interface UserQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  role?: string;
  status?: string;
  search?: string;
}

export const getAllUsers = async (id : string, org_id: string, options: UserQueryOptions) => {
  const { page = 1, limit = 10, sortBy = "created_at", order = "desc", role, status, search } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  let query = supabase
    .from('users')
    .select(`id, email, username, first_name, last_name, status, role, contact_no, 
      profile_pic_url, join_date, manager_id, manager:manager_id(username)`, 
      { count: "exact" })
    .eq('organization_id', org_id)
    .order(sortBy, { ascending: order === "asc" })
    .range(from, to);
  if (role){
    let roles = role.split(',');
    if (roles.length > 1)
      query = query.in("role", roles);
    else
      query = query.eq("role", role);
  } 
  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
  }
  const { data, count, error } = await query;
  if (error) throw new AppError(error.message, 400);
  return { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit), data};
};

export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, first_name, last_name, username, role, organization_id, manager_id")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);
  if (!data) throw new AppError("User not found", 404);

  return data;
};

export const deleteUser = async (id: string, org_id: string) => {
  const { data: leaves, error: leavesError } = await supabase
    .from('leaves')
    .select('id')
    .eq('user_id', id)
    .eq('organization_id', org_id);

  if (leavesError) throw new AppError(leavesError.message, 400);

  const leaveIds = leaves?.map((l) => l.id) || [];

  if (leaveIds.length > 0) {
    const { error: logError } = await supabase
      .from('leave_logs')
      .delete()
      .in('leave_id', leaveIds);

    if (logError) throw new AppError(logError.message, 400);
  }

  const { error: leavesDelErr } = await supabase
    .from('leaves')
    .delete()
    .eq('user_id', id)
    .eq('organization_id', org_id);

  if (leavesDelErr) throw new AppError(leavesDelErr.message, 400);

  const { error: balanceErr } = await supabase
    .from('leave_balances')
    .delete()
    .eq('user_id', id)
    .eq('organization_id', org_id);

  if (balanceErr) throw new AppError(balanceErr.message, 400);

  await deleteProfilePicture(id);

  const { error: userErr } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('organization_id', org_id);

  if (userErr) throw new AppError(userErr.message, 400);
};