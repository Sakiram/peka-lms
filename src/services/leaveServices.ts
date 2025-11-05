// src/services/leaveService.ts
import { supabase } from './dbService';
import { AppError } from '../utils/AppError';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentTime } from '../middleware/commonMiddleware';
import { getUserInfo } from './userService';
import { User } from '../types/user';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LeaveAction = 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Leave {
  id: string;
  organization_id: string;
  user_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  half_day: boolean;
  reason: string;
  attachment_url?: string;
  status: LeaveStatus;
  applied_on: string;
  reviewed_by?: string;
  reviewed_on?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const ensureLeaveBalance = async (
  org_id: string,
  user_id: string,
  leave_type_id: string,
  year: number,
  created_by: string
) => {
  const { data: balance, error: balanceErr } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('organization_id', org_id)
    .eq('user_id', user_id)
    .eq('leave_type_id', leave_type_id)
    .eq('year', year)
    .maybeSingle();

  if (balanceErr) throw new AppError(balanceErr.message, 400);
  if (balance) return balance;

  // Get leave type to know allocation
  const { data: leaveType, error: leaveTypeErr } = await supabase
    .from('leave_types')
    .select('max_days_per_year')
    .eq('id', leave_type_id)
    .single();

  if (leaveTypeErr) throw new AppError(leaveTypeErr.message, 400);
  const now = getCurrentTime();

  const entry = {
    id: uuidv4(),
    organization_id: org_id,
    user_id,
    leave_type_id,
    year,
    allocated_days: leaveType?.max_days_per_year || 0,
    used_days: 0,
    remaining_days: leaveType?.max_days_per_year || 0,
    carried_forward_days: 0,
    created_by,
    created_at: now,
    updated_at: now,
  };

  const { error: insertErr } = await supabase.from('leave_balances').insert([entry]);
  if (insertErr) throw new AppError(insertErr.message, 400);
  return entry;
};

export const validateLeaveRequest = async (
  org_id: string,
  user_id: string,
  leave_type_id: string,
  start_date: string,
  end_date: string,
  total_days: number,
  year: number
) => {
  const { data: overlaps, error: overlapErr } = await supabase
    .from('leaves')
    .select('*')
    .eq('organization_id', org_id)
    .eq('user_id', user_id)
    .in('status', ['PENDING', 'APPROVED'])
    .lte('end_date', end_date)
    .gte('start_date', start_date);

  if (overlapErr) throw new AppError(overlapErr.message, 400);
  if (overlaps && overlaps.length > 0)
    throw new AppError('Overlapping leave request exists', 400);

  const balance = await ensureLeaveBalance(org_id, user_id, leave_type_id, year, user_id);

  if (balance.remaining_days < total_days)
    throw new AppError('Insufficient leave balance', 400);
};

export const applyLeave = async (leave: Omit<Leave, 'id' | 'status' | 'applied_on' | 'created_at' | 'updated_at'>) => {
  const id = uuidv4();
  const nowTime = getCurrentTime();

  const record = {
    ...leave,
    id,
    status: 'PENDING' as LeaveStatus,
    applied_on: nowTime,
    created_at: nowTime,
    updated_at: nowTime,
  };
  const manager = await getManagerInfo(leave.organization_id, leave.user_id);

  const { data, error } = await supabase.from('leaves').insert([record]).select().single();
  if (error) throw new AppError(error.message, 400);

  await addLeaveLog(id, 'CREATED', 'Leave applied', leave.user_id);
  return {data, manager};
};

export const updateLeaveStatus = async (
  id: string,
  managerId: string,
  action: 'APPROVED' | 'REJECTED'
) => {
  const reviewed_on = getCurrentTime();

  const { data: leave, error: leaveErr } = await supabase
    .from('leaves')
    .select('*')
    .eq('id', id)
    .single();

  if (leaveErr) throw new AppError(leaveErr.message, 400);
  if (!leave) throw new AppError('Leave not found', 404);

  // Only manager can act
  const { data: user } = await supabase
    .from('users')
    .select('manager_id')
    .eq('id', leave.user_id)
    .single();

  if (user?.manager_id !== managerId)
    throw new AppError('Only reporting manager can approve/reject', 403);

  const { error: updateErr } = await supabase
    .from('leaves')
    .update({
      status: action,
      reviewed_by: managerId,
      reviewed_on,
      updated_at: reviewed_on,
    })
    .eq('id', id);

  if (updateErr) throw new AppError(updateErr.message, 400);

  // If approved, deduct from balance
  if (action === 'APPROVED') {
    const year = new Date(leave.start_date).getFullYear();
    const { data: balance, error: balErr } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('organization_id', leave.organization_id)
      .eq('user_id', leave.user_id)
      .eq('leave_type_id', leave.leave_type_id)
      .eq('year', year)
      .single();

    if (balErr) throw new AppError(balErr.message, 400);
    if (!balance) throw new AppError('Leave balance missing', 400);

    const used_days = balance.used_days + leave.total_days;
    const remaining_days = balance.remaining_days - leave.total_days;

    await supabase
      .from('leave_balances')
      .update({ used_days, remaining_days, updated_at: reviewed_on })
      .eq('id', balance.id);
  }

  await addLeaveLog(id, action, `Leave ${action.toLowerCase()} by manager`, managerId);
};

export const cancelLeave = async (id: string, userId: string) => {
  const { data: leave } = await supabase.from('leaves').select('*').eq('id', id).single();
  if (!leave) throw new AppError('Leave not found', 404);

  if (leave.status !== 'APPROVED')
    throw new AppError('Only approved leaves can be cancelled', 400);

  const { error: updErr } = await supabase
    .from('leaves')
    .update({ status: 'CANCELLED', updated_at: getCurrentTime() })
    .eq('id', id);

  if (updErr) throw new AppError(updErr.message, 400);

  // Restore balance
  const year = new Date(leave.start_date).getFullYear();
  const { data: balance } = await supabase
    .from('leave_balances')
    .select('*')
    .eq('user_id', leave.user_id)
    .eq('organization_id', leave.organization_id)
    .eq('leave_type_id', leave.leave_type_id)
    .eq('year', year)
    .single();

  if (balance) {
    await supabase
      .from('leave_balances')
      .update({
        used_days: balance.used_days - leave.total_days,
        remaining_days: balance.remaining_days + leave.total_days,
        updated_at: getCurrentTime(),
      })
      .eq('id', balance.id);
  }

  await addLeaveLog(id, 'CANCELLED', 'Leave cancelled by user', userId);
};

export const addLeaveLog = async (leave_id: string, action: LeaveAction, remarks: string, action_by: string) => {
  const { error } = await supabase.from('leave_logs').insert([
    { id: uuidv4(), leave_id, action, remarks, action_by, created_at: getCurrentTime() },
  ]);
  if (error) throw new AppError(error.message, 400);
};

export const getManagerInfo = async (orgId: string, userId: string) => {
    const user = await getUserInfo(orgId, userId);
    if(!user.manager_id){
        throw new AppError('User does not have a reporting manager assigned', 400);
    }
    const { data: manager, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', user.manager_id)
    .single();
    if (error || !manager) {
        throw new AppError('Reporting manager not found', 404);
    }
    return manager;
}