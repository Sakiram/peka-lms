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

export interface LeaveBalance {
  id: string;
  leave_type_id: string;
  year: number;
  allocated_days: number;
  used_days: number;
  remaining_days: number;
  carried_forward_days: number;
  leave_types?: {
    name: string;
  };
}

export interface LeaveLog {
  id: string;
  action: string;
  remarks: string | null;
  created_at: string;
  action_by: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export interface LeaveFilters {
  status?: string;
  year?: number;
  type?: string;
}

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