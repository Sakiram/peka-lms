import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../utils/AppError';
import dotenv from 'dotenv';
dotenv.config();

export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

export const storeNotifications = async (
  notificationId: string,
  userId: string,
  type: string,
  message: string,
  now: string
): Promise<void> => {
  try {
    const { error } = await supabase.from('notifications').insert([
      {
        id: notificationId,
        user_id: userId,
        type,
        message,
        is_read: false,
        created_at: now,
        created_by: userId,
      },
    ]);

    if (error) throw new AppError(error.message, 500);
  } catch (err) {
    console.error('Mail error:', err);
  }
};