import nodemailer from 'nodemailer';
import { storeNotifications } from './dbService';
import { uuid } from '../middleware/commonMiddleware';

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
  const msg = `<h2>Hi ${firstname},</h2><p>Your org ${org_name} is onboarded successfully.</p>`;
  await sendMail(org_email, subject, msg);
  await storeNotifications(notificationId, userId, 'INVITE_SENT', subject, now);
};

const requestMsg = (manager_name: string) => {
  return `<h2>Leave Request</h2><p>Hi ${manager_name}, You have a leave request</p>`;
}

const reviewMsg = (firstName: string, leaveStatus: string) => {
  return `<h2>Leave Request has been ${leaveStatus}</h2><p>Hi ${firstName}, Your leave request has been ${leaveStatus}</p>`;
}

export const inviteEmail = async ( email: string, userId: string, now: string, token: string, org_name: string, firstName: string): Promise<void> => {
  const notificationId = uuid();
  const subject = `Welcome to ${org_name}!`;
  const msg = `<h2>Hi ${firstName},</h2><p>Your are onboarded into ${org_name} successfully.</p>
  <p>Click <a href="http://localhost:5000/auth/set-password?token=${token}">here</a> to set-password and login</p>`;
  await sendMail(email, subject, msg);
  await storeNotifications(notificationId, userId, 'INVITE_SENT', subject, now);
};

export const requestEmail = async ( email: string, managerName: string, userId: string, now: string): Promise<void> => {
  const notificationId = uuid();
  const subject = `Leave Request`;
  const msg = requestMsg(managerName);
  await sendMail(email, subject, msg);
  await storeNotifications(notificationId, userId, 'LEAVE_APPLIED', subject, now);
};

export const reviewEmail = async ( email: string, firstName: string, userId: string, leaveStatus:string, now: string): Promise<void> => {
  const notificationId = uuid();
  const subject = `your leave has been reviewed`;
  const msg = reviewMsg(firstName, leaveStatus);
  await sendMail(email, subject, msg);
  await storeNotifications(notificationId, userId, leaveStatus, subject, now);
};