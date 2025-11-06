import { NextFunction, Request, Response } from 'express';
import * as leaveTypeService from '../services/leaveTypeService';
import { getCurrentTime, uuid } from '../middleware/commonMiddleware';

export const createLeaveType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, max_days_per_year, requires_document, carry_forward } = req.body;

    const userId = req.user?.id!;
    const orgId = req.user?.org_id!;
    const now = getCurrentTime();

    const leaveType = {
      id: uuid(),
      organization_id: orgId,
      name,
      description,
      max_days_per_year,
      requires_document,
      carry_forward,
      active: true,
      created_by: userId,
      created_at: now,
      updated_at: now,
    };

    await leaveTypeService.checkDuplicateLeave(orgId, name);
    await leaveTypeService.addLeaveType(leaveType);
    res.status(201).json({ message: 'Leave type created successfully', leaveType });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllLeaveTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.user?.org_id!;
    const leaveTypes = await leaveTypeService.getLeaveTypes(orgId);
    res.status(200).json(leaveTypes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const editLeaveType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const orgId = req.user.org_id;
    await leaveTypeService.checkDuplicateLeave(orgId, updates.name, id);
    await leaveTypeService.updateLeaveType(id, updates);
    res.status(200).json({ message: 'Leave type updated successfully' });
  } catch (err: any) {
        next(err);
  }
};

export const deleteLeaveType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await leaveTypeService.deleteLeaveType(id);
    res.status(200).json({ message: 'Leave type deleted successfully' });
  } catch (err: any) {
    next(err);
  }
};