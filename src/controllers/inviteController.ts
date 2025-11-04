import { randomBytes } from "crypto";
import { inviteEmail } from '../services/emailService';
import { addUser, checkDuplicateUser } from "../services/userService"
import { addInvites } from '../services/inviteService';
import { getCurrentTime, uuid } from '../middleware/commonMiddleware';
import { Request, Response } from "express";
import { AppError, getErrorMessage } from "../utils/AppError";

export const createInvite = async (req: Request, res: Response) => {
  try {
    const { email, role, reporting_to } = req.body;
    const token = randomBytes(32).toString("hex");
    const now = getCurrentTime();
    const userId = req.user.id;
    const organization_id = req.user.org_id;
    
    await addInvites(uuid(), organization_id, email,role, reporting_to, token, userId, now);
    const duplicateUser = await checkDuplicateUser(organization_id, email);
    if (!duplicateUser) {
      await addUser(uuid(), organization_id, email, "", null, null, null, reporting_to , "INACTIVE", role, now);
    }
    await inviteEmail(email, token, req.user.id, now);
    res.status(201).json({ invite: token });
  } catch (err) {
    throw new AppError(getErrorMessage(err), 500);
  }
};
