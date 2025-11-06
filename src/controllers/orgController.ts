import { WelcomeEmail } from "../services/emailService"
import { hashPassword } from "../services/authService";
import {NextFunction, Request, Response} from "express";
import { checkDuplicateOrg, createOrg } from "../services/orgService";
import { addUser } from "../services/userService";
import { getCurrentTime, uuid } from '../middleware/commonMiddleware';
import { AppError } from '../utils/AppError';
import { User } from "../types/userTypes";

export const createOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { org_name, domain, org_email, password, firstname, lastname, username } = req.body;
    if (!org_name || !domain || !org_email || !password || !firstname || !lastname || !username) {
      throw new AppError("All fields are required.", 400);
    }
    const isDuplicate = await checkDuplicateOrg(org_email, domain);
    if(isDuplicate) {
      res.status(409).json({message: "Organization email or domain already present"});
    }
    const hashedPassword = await hashPassword(password);
    const orgId = uuid();
    const userId = uuid();
    const notificationId = uuid();
    const now = getCurrentTime();

    const orgError = await createOrg(orgId, org_name, org_email, domain, now, userId);
    if (orgError) {
      res.status(400).json({message: "Organization creation failed."});
    }
    const data:User = { id: userId, org_id: orgId, email:org_email, password:hashedPassword, first_name:firstname, last_name:lastname, username, status: "ACTIVE", role: "ADMIN", created_at: now, created_by: userId};
    await addUser(data);
    WelcomeEmail( org_email, org_name, firstname, notificationId, now, userId);
    return res.status(201).json({
      message: "Organization created successfully.",
      organization_id: orgId,
      admin_id: userId,
    });
  } catch (err) {
    next(err);
  }
};
