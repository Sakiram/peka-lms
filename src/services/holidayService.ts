import { supabase } from './dbService';
import { PostgrestError } from '@supabase/supabase-js';
import { AppError } from '../utils/AppError';
import { Holiday } from '../types/holidayTypes';
import { redis } from '../worker/redis';

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

export const getHolidaysCacheKey = (orgId: string, rangeDays?: number, all?: boolean) => {
  return `holidays:${orgId}:${rangeDays ?? 'none'}:${all ? 'all' : 'upcoming'}`;
}

export const invalidateHolidaysCache = async (org_id: string) => {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', `holidays:${org_id}:*`, 'COUNT', 100);
    if (keys.length) {
      await redis.del(...keys);
    }
    cursor = nextCursor;
  } while (cursor !== '0');
}

export const getHolidays = async (org_id: string, nextDays?: number, all?: boolean): Promise<Holiday[]> => {
  const { data, error } = await supabase
    .from('holidays')
    .select('*')
    .eq('organization_id', org_id)
    .order('holiday_date', { ascending: true });

  if (error) throw new AppError(error.message, 400);
  if (!data) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const nextDate = new Date();
  if (nextDays && !isNaN(nextDays)) nextDate.setDate(today.getDate() + nextDays);

  return data
    .map((h) => {
      const baseDate = new Date(h.holiday_date);
      const adjustedDate = h.recurring
        ? new Date(`${year}-${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`)
        : baseDate;

      const isUpcoming = adjustedDate >= today;
      const dateStr = `${adjustedDate.getFullYear()}-${String(adjustedDate.getMonth() + 1).padStart(2, '0')}-${String(adjustedDate.getDate()).padStart(2, '0')}`;
      return {
        ...h,
        holiday_date: dateStr,
        is_upcoming: isUpcoming,
      };
    })
    .filter((h) => {
      const date = new Date(h.holiday_date);
      if (nextDays && !isNaN(nextDays)) {
        return date >= today && date <= nextDate;
      }
      if (all) return true;
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