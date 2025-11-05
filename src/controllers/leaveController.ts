import { Request, Response, NextFunction } from 'express';
import * as leaveService from '../services/leaveServices';
import { inviteEmail } from '../services/emailService';
import { getCurrentTime } from '../middleware/commonMiddleware';

export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leave_type_id, start_date, end_date, total_days, half_day, reason, attachment_url } = req.body;
    const orgId = req.user?.org_id!;
    const userId = req.user?.id!;
    const year = new Date(start_date).getFullYear();
    const now = getCurrentTime();

    await leaveService.validateLeaveRequest(orgId, userId, leave_type_id, start_date, end_date, total_days, year);

    const {data, manager} = await leaveService.applyLeave({
      organization_id: orgId,
      user_id: userId,
      leave_type_id,
      start_date,
      end_date,
      total_days,
      half_day,
      reason,
      attachment_url,
      created_by: userId,
    });
    console.log(manager.email, req.user.id, now );
    await inviteEmail(manager.email, req.user.id, now,);

    res.status(201).json({ message: 'Leave applied successfully', data });
  } catch (err) {
    next(err);
  }
};

export const approveLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const managerId = req.user?.id!;
    await leaveService.updateLeaveStatus(id, managerId, 'APPROVED');
    res.status(200).json({ message: 'Leave approved successfully' });
  } catch (err) {
    next(err);
  }
};

export const rejectLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const managerId = req.user?.id!;
    await leaveService.updateLeaveStatus(id, managerId, 'REJECTED');
    res.status(200).json({ message: 'Leave rejected successfully' });
  } catch (err) {
    next(err);
  }
};

export const cancelLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id!;
    await leaveService.cancelLeave(id, userId);
    res.status(200).json({ message: 'Leave cancelled successfully' });
  } catch (err) {
    next(err);
  }
};