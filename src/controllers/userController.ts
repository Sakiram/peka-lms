import sharp from 'sharp';
import * as userService from '../services/userService';
import * as storageService from '../services/storageService';
import { getErrorMessage } from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';
import { redis } from '../worker/redis';

export const createUser = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const user = await userService.addUser(data);
    await userService.invalidateUserCache(req.user?.org_id!, req.user?.id!);
    res.status(201).json({ user: user[0] })
  } catch (err) {
    return res.status(500).json({ error: getErrorMessage(err) });
  }
};

export const uploadUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const userId = req.user?.id!;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    let profileUrl: string | undefined;
    if (file) {
       if (!allowedTypes.includes(file.mimetype)) {
        next('Only JPG, JPEG, or PNG files are allowed');
      }
      const buffer = await sharp(file.buffer).webp({ quality: 80 }).toBuffer();
      profileUrl = await storageService.uploadProfilePicture(userId, buffer, 'image/webp');
    }
    res.status(200).json({ success: true, data: profileUrl});
  } catch (err) {
    next(err);
  }
}

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = req.body;
    const userId = req.params.id;
    const orgId = req.user?.org_id!;
    const updated = await userService.updateProfile(orgId, userId, userData);
    await userService.invalidateUserCache(orgId, req.user?.id!);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org_id = req.user.org_id!;
    const id = req.user.id!;
    const { page = "1", limit = "10", sortBy = "created_at", order = "desc",
      role, status, search,} = req.query as Record<string, string>;
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      order: order.toLowerCase() === "asc" ? "asc" : "desc" as "asc" | "desc",
      role,
      status,
      search,
    };
    const cacheKey = userService.getCacheKey(org_id, id, options);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, data: JSON.parse(cached) });
    }
    const users = await userService.getAllUsers(id, org_id, options);
    await redis.set(cacheKey, JSON.stringify(users), "EX", Number(process.env.REDIS_EXPIRES_IN) || 60 * 20);
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
    await userService.invalidateUserCache(org_id, req.user?.id!);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};