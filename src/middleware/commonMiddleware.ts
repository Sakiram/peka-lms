import { v4 as uuidv4 } from 'uuid';

export const getCurrentTime = (): string => new Date().toISOString();
export const uuid = (): string => uuidv4();
