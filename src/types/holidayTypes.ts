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