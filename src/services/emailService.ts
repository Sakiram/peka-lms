import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { storeNotifications } from './dbService';
import { uuid } from '../middleware/commonMiddleware';

dotenv.config();

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
  const msg = `<h2>Hi ${firstname},</h2><p>Your org ${org_name} onboarded successfully.</p>`;
  await sendMail(org_email, subject, msg);
  await storeNotifications(notificationId, userId, 'INVITE_SENT', subject, now);
};

export const inviteEmail = async (
  email: string,
  userId: string,
  now: string,
  token?: string
): Promise<void> => {
  const notificationId = uuid();
  const subject = `Welcome to leo!`;
  const msg = `<h2>Hi leo,</h2><p>Your org ${token} onboarded successfully.</p>`;
  await sendMail(email, subject, msg);
  await storeNotifications(notificationId, userId, 'INVITE_SENT', subject, now);
};