import { supabase } from './dbService';

export const checkDuplicateOrg = async (org_email: string, domain: string): Promise<any> => {
  const { data: existingOrg, error } = await supabase
    .from('organizations')
    .select('*')
    .or(`org_email.eq.${org_email},domain.eq.${domain}`)
    .maybeSingle();
  if (error) throw error;
  return existingOrg;
};

export const createOrg = async (
  orgId: string,
  org_name: string,
  org_email: string,
  domain: string,
  now: string,
  userId: string
): Promise<any> => {
  const { error } = await supabase.from('organizations').insert([
    {
      id: orgId,
      org_name,
      org_email,
      domain,
      created_at: now,
      updated_at: now,
      created_by: userId,
    },
  ]);
  return error;
};