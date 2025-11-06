import sharp from 'sharp';
import * as userService from '../services/userService';
import { getErrorMessage } from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';

export const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const user = await userService.addUser(data);
    res.status(201).json({ user: user[0] })
  } catch (err) {
    return res.status(500).json({ error: getErrorMessage(err) });
  }
};

export const uploadUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const userId = req.user?.id!;
    const orgId = req.user?.org_id!;
    let profileUrl: string | undefined;
    if (file) {
      const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
      profileUrl = await userService.uploadProfilePicture(userId, buffer, 'image/webp');
    }
    // const updated = await userService.updateProfile(orgId, userId, { profile_pic_url: profileUrl });
    res.status(200).json({ success: true, data: profileUrl});
      // updated });
  } catch (err) {
    next(err);
  }
}

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contact_no, profile_pic_url } = req.body;
    const userId = req.user?.id!;
    const orgId = req.user?.org_id!;
    const updated = await userService.updateProfile(orgId, userId, {
      contact_no, profile_pic_url
    });

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org_id = req.user.org_id!;
    const users = await userService.getAllUsers(org_id);
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const org_id = req.user.org_id!;
    await userService.deleteUser(id, org_id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};