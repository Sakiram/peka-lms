import { supabase } from './dbService';

export const addInvites = async (
  id: string,
  organization_id: string,
  email: string,
  role: string,
  reporting_to: string | null,
  token: string,
  userId: string,
  now: string
): Promise<void> => {
  await supabase
    .from('invites')
    .insert([
      {
        id,
        organization_id,
        email,
        role,
        reporting_to: reporting_to || null,
        token,
        created_by: userId,
        created_at: now,
        updated_at: now,
      },
    ])
    .select()
    .single();
};

export const updateInvite = async (invite: { id: string }): Promise<any> => {
  const { error } = await supabase.from('invites').update({ status: 'ACCEPTED' }).eq('id', invite.id);
  return error;
};