import { supabase } from './dbService';
import { PostgrestError } from '@supabase/supabase-js';
import { AppError } from '../utils/AppError';

export interface Holiday {
  id: string;
  organization_id: string;
  name: string;
  holiday_date: string;
  recurring: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export const checkDuplicateHoliday = async (org_id: string, name: string, id?: string) => {
  const { data: existingHoliday, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('organization_id', org_id)
    .eq('name', name)
    .maybeSingle();
    
  if (error) throw new AppError(error.message, 400);
  if (existingHoliday && id!= existingHoliday.id) throw new AppError(`Leave with name: ${name} already exists`, 400);
  if ( existingHoliday && !id ) throw new AppError(`Leave with name: ${name} already exists`, 400);
};

export const addHoliday = async (holiday: Holiday) => {
  const { error } = await supabase.from('holidays').insert([holiday]);
  if (error) throw new AppError(error.message, 400);
};

export const getHolidays = async (org_id: string, nextDays?: number): Promise<Holiday[]> => {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('organization_id', org_id)
    .order('holiday_date', { ascending: true });

  if (error) throw new AppError(error.message, 400);
  if (!data) return [];
  
  const today = new Date();
  const year = today.getFullYear();
  const nextDate = new Date();
  if (nextDays && !isNaN(nextDays)) 
    nextDate.setDate(today.getDate() + nextDays);

  return data
    .map((h) => {
      const baseDate = new Date(h.holiday_date);
      const adjustedDate = h.recurring ? new Date(`${year}-${baseDate.getMonth() + 1}-${baseDate.getDate()}`) : baseDate;

      const isUpcoming = adjustedDate >= today;
      return {
        ...h,
        holiday_date: adjustedDate.toISOString().split('T')[0],
        is_upcoming: isUpcoming,
      };
    })
    .filter((h) => {
      const date = new Date(h.holiday_date);
      if (nextDays && !isNaN(nextDays)) {
        return date >= today && date <= nextDate;
      }
      return date.getFullYear() === year;
    });
};

export const updateHoliday = async (id: string, updates: Partial<Holiday>): Promise<Holiday> => {
  const { data, error }: { data: Holiday[] | null; error: PostgrestError | null } = await supabase
    .from('holidays')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) throw new AppError(error.message, 400);
  if (!data || data.length === 0) throw new AppError('Holiday not found', 404);

  return data[0];
};

export const deleteHoliday = async (id: string): Promise<void> => {
  const { data, error }: { data: Holiday[] | null; error: PostgrestError | null } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id)
    .select();

  if (error) throw new AppError(error.message, 400);
  if (!data || data.length === 0) throw new AppError('Holiday not found', 404);
};