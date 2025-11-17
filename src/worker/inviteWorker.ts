import { Worker, Job } from 'bullmq';
import { redisConnection } from '../worker/redis';
import { InviteJobData } from '../queues/inviteQueue';
import { randomBytes } from 'crypto';
import { v4 as uuid } from 'uuid';
import { getCurrentTime } from '../middleware/commonMiddleware';
import * as userService from '../services/userService';
import { inviteEmail } from '../services/emailService';
import { User } from '../types/userTypes';
import { addInvites } from '../services/inviteService';

const processInviteJob = async (job: Job<InviteJobData>) => {
  const { 
    email, 
    role, 
    reporting_to, 
    organization_id, 
    created_by,
    org_name,
    creator_first_name 
  } = job.data;

  try {
    const token = randomBytes(32).toString("hex");
    const now = getCurrentTime();
    const id = uuid();
    const status = "INACTIVE";
    await addInvites(
      id, 
      organization_id || '', 
      email, 
      role, 
      reporting_to, 
      token, 
      created_by, 
      now
    );
    const duplicateUser = await userService.checkDuplicateUser(organization_id?? '', email);
    
    if (!duplicateUser) {
      const userData: User = {
        id,
        org_id: organization_id || '',
        email,
        password: "",
        manager_id: reporting_to || '',
        status,
        role,
        created_at: now,
        created_by: created_by,
      };
      await userService.addUser(userData);
    }

    await inviteEmail(email, created_by, now, token, org_name, creator_first_name);

    return { success: true, email, token };
  } catch (error) {
    console.error(`Failed to process invite for ${email}:`, error);
    throw error;
  }
};

export const inviteWorker = new Worker<InviteJobData>(
  'invite-queue',
  processInviteJob,
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

inviteWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed for email: ${job.data.email}`);
});

inviteWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed for email: ${job?.data.email}`, err);
});