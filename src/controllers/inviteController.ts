import { randomBytes } from "crypto";
import { inviteEmail } from '../services/emailService';
import { addUser, checkDuplicateUser } from "../services/userService"
import { addInvites } from '../services/inviteService';
import { getCurrentTime, uuid } from '../middleware/commonMiddleware';
import { NextFunction, Request, Response } from "express";
import { AppError, getErrorMessage } from "../utils/AppError";
import { User } from "../types/user";

export const createInvite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, role, reporting_to } = req.body;
    const token = randomBytes(32).toString("hex");
    const now = getCurrentTime();
    const userId = req.user.id;
    const organization_id = req.user.org_id;

    await addInvites(uuid(), organization_id, email,role, reporting_to, token, userId, now);
    const duplicateUser = await checkDuplicateUser(organization_id, email);
    if (!duplicateUser) {
      const data:User = { id: uuid(), org_id: organization_id, email, password:"", manager_id: reporting_to, status: "ACTIVE", role, created_at: now, created_by: userId};
      await addUser(data);
    }
    await inviteEmail(email, token, req.user.id, now);
    res.status(201).json({ invite: token });
  } catch (err) {
    next(err);
  }
};
