import { WelcomeEmail } from "../services/emailService"
import { hashPassword } from "../services/authService";
import {Request, Response} from "express";
import { checkDuplicateOrg, createOrg } from "../services/orgService";
import { addUser } from "../services/userService";
import { getCurrentTime, uuid } from '../middleware/commonMiddleware';
import { AppError, getErrorMessage } from '../utils/AppError';
import dotenv from 'dotenv';

dotenv.config();

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const { org_name, domain, org_email, password, firstname, lastname, username } = req.body;
    if (!org_name || !domain || !org_email || !password || !firstname || !lastname || !username) {
      throw new AppError("All fields are required.", 400);
    }
    const isDuplicate = await checkDuplicateOrg(org_email, domain);
    if(isDuplicate) {
      throw new AppError("Organization email or domain already present", 409);
    }
    
    const hashedPassword = await hashPassword(password);
    const orgId = uuid();
    const userId = uuid();
    const notificationId = uuid();
    const now = getCurrentTime();

    const orgError = await createOrg(orgId, org_name, org_email, domain, now, userId);
     if (orgError) {
      throw new AppError( "Organization creation failed.", 400)
    }
    const userErr = await addUser(userId, orgId, org_email, hashedPassword, firstname, lastname, username, null, "ACTIVE", "ADMIN", now);
    if (userErr){
      throw new AppError("Admin creation failed.", 400);
    }
    WelcomeEmail( org_email, org_name, firstname, notificationId, now, userId);
    return res.status(201).json({
      message: "Organization created successfully.",
      organization_id: orgId,
      admin_id: userId,
    });
  } catch (err) {
    throw new AppError("Internal server error", 500)
  }
};
