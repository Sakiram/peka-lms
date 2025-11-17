import { randomBytes } from "crypto";
import { inviteEmail } from '../services/emailService';
import * as userService from "../services/userService"
import { addInvites } from '../services/inviteService';
import { getCurrentTime, uuid } from '../middleware/commonMiddleware';
import { NextFunction, Request, Response } from "express";
import { User } from "../types/userTypes";
import { isValidRole, UserRole } from '../queues/inviteQueue';
import { inviteQueue } from '../queues/inviteQueue';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

export const createInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role, reporting_to } = req.body;
    const token = randomBytes(32).toString("hex");
    const now = getCurrentTime();
    const userId = req.user.id;
    const id = uuid();
    const status = "INACTIVE";
    const organization_id = req.user.org_id;

    await addInvites(id, organization_id, email,role, reporting_to, token, userId, now);
    const duplicateUser = await userService.checkDuplicateUser(organization_id, email);
    const orgName = await userService.getOrgName(organization_id);
    if (!duplicateUser) {
      const data:User = { id, org_id: organization_id, email, password:"", manager_id: reporting_to, status, role, created_at: now, created_by: userId};
      await userService.addUser(data);
    }
    await inviteEmail(email, req.user.id, now, token, orgName.data?.org_name, req.user.first_name);
    res.status(201).json({ invite: token });
  } catch (err) {
    next(err);
  }
};

export const bulkInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file uploaded' });
    } 
    const userId = req.user.id;
    const organization_id = req.user.org_id;
    const orgName = await userService.getOrgName(organization_id);
    
    const invites: Array<{ email: string; role: UserRole; reporting_to: string | null }> = [];
    const errors: string[] = [];

    const stream = Readable.from(req.file.buffer.toString());
    
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csvParser({ 
          headers: ['email', 'role', 'reporting_to'],
          skipLines: 1,
        }))
        .on('data', (row) => {
          if (!row.email || !row.role) {
            errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
            return;
          }
          const roleUpper = row.role.trim().toUpperCase();
          if (!isValidRole(roleUpper)) {
            errors.push(
              `Invalid role "${row.role}" for ${row.email}. Must be one of: ADMIN, HR, EMPLOYEE, MANAGER`
            );
            return;
          }
          
          invites.push({
            email: row.email.trim(),
            role: roleUpper as UserRole,
            reporting_to: row.reporting_to?.trim() || null,
          });
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    if (invites.length === 0) {
      return res.status(400).json({ 
        error: 'No valid invites found in CSV',
        errors 
      });
    }
    
    const jobs = await inviteQueue.addBulk(
      invites.map((invite) => ({
        name: 'bulk-invite',
        data: {
          ...invite,
          organization_id,
          created_by: userId,
          org_name: orgName.data?.org_name || '',
          creator_first_name: req.user.first_name,
        },
      }))
    );

    res.status(202).json({
      message: `${invites.length} invites queued for processing`,
      jobIds: jobs.map(j => j.id),
      total: invites.length,
      skipped: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// export const getJobStatus = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { jobId } = req.params;
//     const job = await inviteQueue.getJob(jobId);
    
//     if (!job) {
//       return res.status(404).json({ error: 'Job not found' });
//     }

//     const state = await job.getState();
    
//     res.json({
//       id: job.id,
//       state,
//       email: job.data.email,
//       result: job.returnvalue,
//       failedReason: job.failedReason,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
