import { Queue } from 'bullmq';
import { redisConnection } from '../worker/redis';

export interface InviteJobData {
  batchId?: string;
  organization_id?: string | undefined;
  email: string;
  role: UserRole;
  reporting_to: string | null;
  created_by: string;
  org_name: string;
  creator_first_name: string;
}
export type UserRole = "ADMIN" | "HR" | "EMPLOYEE" | "MANAGER";

export function isValidRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ["ADMIN", "HR", "EMPLOYEE", "MANAGER"];
  return validRoles.includes(role.toUpperCase() as UserRole);
}

export const inviteQueue = new Queue<InviteJobData>('invite-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});