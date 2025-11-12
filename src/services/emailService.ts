import nodemailer from 'nodemailer';
import { storeNotifications } from './dbService';
import { uuid } from '../middleware/commonMiddleware';
import { baseEmailTemplate, inviteEmailTemplate, requestEmailTemplate, reviewEmailTemplate, welcomeEmailTemplate } from '../templates/emailTemplates';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Mail error:', err);
  }
};

export const WelcomeEmail = async (
  org_email: string,
  org_name: string,
  firstname: string,
  notificationId: string,
  now: string,
  userId: string
): Promise<void> => {
  const subject = `Welcome to ${org_name}!`;
  const content = welcomeEmailTemplate(org_email, org_name, firstname);
  const msg = baseEmailTemplate(content).replace(/{{ORG_NAME}}/g, org_name);
  await sendMail(org_email, subject, msg);
  await storeNotifications(notificationId, userId, 'INVITE_SENT', subject, now);
};

export const inviteEmail = async ( email: string, userId: string, now: string, token: string, org_name: string, firstName: string): Promise<void> => {
  const notificationId = uuid();
  const subject = `Welcome to ${org_name}!`;
  const content = inviteEmailTemplate(token, org_name, firstName);
  const msg = baseEmailTemplate(content).replace(/{{ORG_NAME}}/g, org_name);
  await sendMail(email, subject, msg);
  await storeNotifications(notificationId, userId, 'INVITE_SENT', subject, now);
};

export const requestEmail = async ( email: string, managerName: string, userId: string, now: string, userName: string, leave_type_name: string, start_date: string, end_date: string): Promise<void> => {
  const notificationId = uuid();
  const subject = `New Leave Request Pending Review`;
  const content = requestEmailTemplate(managerName, userName, leave_type_name, start_date, end_date);
  const msg = baseEmailTemplate(content).replace(/{{ORG_NAME}}/g, 'Leave Management System');
  await sendMail(email, subject, msg);
  await storeNotifications(notificationId, userId, 'LEAVE_APPLIED', subject, now);
};

export const reviewEmail = async ( email: string, firstName: string, userId: string, leaveStatus:string, now: string, reviewedBy?: string, leaveType?: string): Promise<void> => {
  const notificationId = uuid();
  const subject = `Your Leave Request Has Been ${leaveStatus}`;
  let leaveStat = leaveStatus === 'APPROVED' ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';
  const isApproved = leaveStatus === 'APPROVED';
  const content = reviewEmailTemplate(firstName, leaveStatus, leaveType, reviewedBy, isApproved);
  const msg = baseEmailTemplate(content).replace(/{{ORG_NAME}}/g, 'Leave Management System');
  await sendMail(email, subject, msg);
  await storeNotifications(notificationId, userId, leaveStat, subject, now);
};