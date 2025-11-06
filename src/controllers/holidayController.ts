import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentTime } from '../middleware/commonMiddleware';
import * as holidayService from '../services/holidayService';
import { AppError } from '../utils/AppError';

export const createHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, holiday_date, recurring } = req.body;
    if (!name || !holiday_date)
      throw new AppError('Name and holiday_date are required', 400);
    const orgId = req.user?.org_id!;
    const userId = req.user?.id!;
    const now = getCurrentTime();

    const holiday = {
      id: uuidv4(),
      organization_id: orgId,
      name,
      holiday_date,
      recurring,
      created_by: userId,
      created_at: now,
      updated_at: now,
    };

    await holidayService.checkDuplicateHoliday(orgId, name);
    await holidayService.addHoliday(holiday);
    res.status(201).json({ message: 'Holiday added successfully', holiday });
  } catch (err) {
    next(err);
  }
};

export const getAllHolidays = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.org_id!;
    const { next } = req.query;
    const rangeDays = next ? parseInt(String(next).replace('d', ''), 10) : undefined;
    const holidays = await holidayService.getHolidays(orgId, rangeDays);
    res.status(200).json(holidays);
  } catch (err) {
    next(err);
  }
};

export const editHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await holidayService.checkDuplicateHoliday(req.user.org_id, updates.name, id);
    const updated = await holidayService.updateHoliday(id, updates);
    res.status(200).json({ message: 'Holiday updated successfully', updated });
  } catch (err) {
    next(err);
  }
};

export const deleteHoliday = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await holidayService.deleteHoliday(id);
    res.status(200).json({ message: 'Holiday deleted successfully' });
  } catch (err) {
    next(err);
  }
};