import { URL } from "url";
import { ConnectionOptions } from "bullmq";
import Redis from 'ioredis';

const redisUrl = new URL(process.env.REDIS_URL!);

export const redisConnection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username,
  password: redisUrl.password,
  tls: redisUrl.protocol === "rediss:" ? {} : undefined,
};

export const redis = new Redis({
  host: redisUrl.hostname,
  port: parseInt( redisUrl.port || "6379"),
  password: redisUrl.password,
});