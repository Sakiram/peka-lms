import { Request, Response, NextFunction } from 'express';
import * as leaveService from '../services/leaveServices';
import { requestEmail, reviewEmail } from '../services/emailService';
import { getCurrentTime } from '../middleware/commonMiddleware';

export const getMyLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.org_id!;
    const userId = req.user?.id!;
    const { status, type } = req.query;
    const filters = {
      status: status ? String(status).toUpperCase() : undefined,
      type: type ? String(type).toUpperCase() : undefined,
    };
    const leaves = await leaveService.getUserLeaves(orgId, userId, filters);
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const getRequestedLeaves = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.org_id!;
    const managerId = req.user?.id!;
    const leaves = await leaveService.getManagerLeaves(orgId, managerId);
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

export const applyLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { leave_type_id, start_date, end_date, total_days, half_day, reason, attachment_url } = req.body;
    const orgId = req.user?.org_id!;
    const userId = req.user?.id!;
    const manager_id  = req.user?.manager_id!;
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
    }, manager_id);
    await requestEmail(manager.email, manager.first_name, req.user.id, now,);

    res.status(201).json({ message: 'Leave applied successfully', data });
  } catch (err) {
    next(err);
  }
};

export const approveLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const managerId = req.user?.id!;
    const leaveStatus = 'APPROVED';
    const now = getCurrentTime();
    const user = await leaveService.updateLeaveStatus(userId, managerId, leaveStatus);
    await reviewEmail(user.email, user.first_name, managerId, leaveStatus, now);
    res.status(200).json({ message: 'Leave approved successfully' });
  } catch (err) {
    next(err);
  }
};

export const rejectLeave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const managerId = req.user?.id!;
    const leaveStatus = 'REJECTED';
    const now = getCurrentTime();
    const user = await leaveService.updateLeaveStatus(id, managerId, leaveStatus);
    await reviewEmail(user.email, user.first_name, managerId, leaveStatus, now);
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

export const getLeaveBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.user?.org_id!;
    const userId = req.user?.id!;
    const balances = await leaveService.getUserLeaveBalance(orgId, userId);

    const chartData = balances.map((b) => ({
      type: b.leave_types?.name ?? 'Unknown',
      allocated: b.allocated_days,
      used: b.used_days,
      remaining: b.remaining_days,
    }));

    res.status(200).json({
      success: true,
      data: chartData,
      raw: balances,
    });
  } catch (err) {
    next(err);
  }
};

export const getLeaveLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: leaveId } = req.params;
    const logs = await leaveService.getLeaveLogs(leaveId);

    const formatted = logs.map((log) => ({
      action: log.action,
      by: `${log.user?.first_name ?? ''} ${log.user?.last_name ?? ''}`.trim(),
      role: log.user?.role ?? 'Unknown',
      when: log.created_at,
      remarks: log.remarks,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};