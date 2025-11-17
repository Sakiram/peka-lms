import { ConnectionOptions } from "bullmq";

export const redisConnection: ConnectionOptions = {
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};