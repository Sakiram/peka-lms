import { randomBytes } from "crypto";
import { inviteEmail } from '../services/emailService';
import { addUser, checkDuplicateUser, getOrgName } from "../services/userService"
import { addInvites } from '../services/inviteService';
import { getCurrentTime, uuid } from '../middleware/commonMiddleware';
import { NextFunction, Request, Response } from "express";
import { User } from "../types/user";

export const createInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role, reporting_to } = req.body;
    const token = randomBytes(32).toString("hex");
    const now = getCurrentTime();
    const userId = req.user.id;
    const id = uuid();
    const status = "ACTIVE";
    const organization_id = req.user.org_id;

    await addInvites(id, organization_id, email,role, reporting_to, token, userId, now);
    const duplicateUser = await checkDuplicateUser(organization_id, email);
    const orgName = await getOrgName(organization_id);
    if (!duplicateUser) {
      const data:User = { id, org_id: organization_id, email, password:"", manager_id: reporting_to, status, role, created_at: now, created_by: userId};
      await addUser(data);
    }
    await inviteEmail(email, req.user.id, now, token, orgName.data?.org_name, req.user.first_name);
    res.status(201).json({ invite: token });
  } catch (err) {
    next(err);
  }
};
