import multer from "multer";
import { AppError } from "../utils/AppError";
import { supabase } from "./dbService";

const BUCKET_NAME = process.env.BUCKET_NAME || 'attachments';
export const uploadImage = multer({
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, JPEG, or PNG files are allowed'));
    }
    cb(null, true);
  },
});

export const uploadDoc = multer({
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF and DOCX files are allowed'));
    }
    cb(null, true);
  },
});

export const uploadProfilePicture = async (userId: string, fileBuffer: Buffer, mimeType: string) => {
  const fileName = `${userId}.webp`;
  const filePath = `profile_pics/${fileName}`;
  await deleteProfilePicture(userId);
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      upsert: true,
      contentType: mimeType,
    });
  if (uploadError) throw new AppError(uploadError.message, 400);
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  return publicUrlData.publicUrl;
};

export const uploadAttachment = async (userId: string, fileBuffer: Buffer, mimeType: string) => {
  const ext = mimeType === 'application/pdf' ? 'pdf' : 'docx';
  const fileName = `${userId}-${Date.now()}.${ext}`;
  const filePath = `leave_proof/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      cacheControl: '3600',
      upsert: true,
      contentType: mimeType,
    });
  if (uploadError) throw new AppError(uploadError.message, 400);
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);
  return publicUrlData.publicUrl;
};

export const deleteProfilePicture = async (userId: string) => {
  const fileName = `${userId}.webp`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([`profile_pics/${fileName}`]);

  if (error && !error.message.includes('not found')) {
    console.warn(`Failed to delete old profile pic for user ${userId}:`, error.message);
  }
};