import { getCurrentTime } from '../middleware/commonMiddleware';
import { AppError } from '../utils/AppError';
import { supabase } from './dbService';

export interface LeaveType {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  max_days_per_year: number;
  requires_document: boolean;
  carry_forward: boolean;
  active: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export const checkDuplicateLeave = async (org_id: string, name: string, id?: string) => {
  const { data: existingLeave, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('organization_id', org_id)
    .eq('name', name)
    .maybeSingle();
  if (error) throw new AppError(error.message, 400);
  if ( existingLeave && id !== existingLeave.id ) throw new AppError(`Leave with name: ${name} already exists`, 400);
  if (existingLeave && !id) throw new AppError(`Leave with name: ${name} already exists`, 400);
};

export const addLeaveType = async (data: LeaveType) => {
    const { error } = await supabase.from('leave_types').insert([data]);
    if (error) throw new AppError(error.message);
};

export const getLeaveTypes = async (org_id: string) => {
  const { data, error } = await supabase
    .from('leave_types')
    .select('*')
    .eq('organization_id', org_id)
    .order('created_at', { ascending: false });
  if (error) throw new AppError(error.message);
  return data;
};

export const updateLeaveType = async (id: string, updates: Partial<LeaveType>) => {
  const now = getCurrentTime();
  const { data, error } = await supabase
    .from('leave_types')
    .update({ ...updates, updated_at: now })
    .eq('id', id)
    .select();
  if (!data || data.length === 0) {
    throw new AppError('Leave type id not found', 404);
  }
  if (error) throw new AppError(error);
};

export const deleteLeaveType = async (id: string) => {
  const { data, error } = await supabase.from('leave_types').delete().eq('id', id).select();
  if (!data || data.length === 0) {
    throw new AppError('Leave type not found', 404);
  }
  if (error) throw new AppError(error);
};