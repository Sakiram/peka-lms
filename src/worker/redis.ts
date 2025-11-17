import { URL } from "url";
import { ConnectionOptions } from "bullmq";

const redisUrl = new URL(process.env.REDIS_URL!);

export const redisConnection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port),
  username: redisUrl.username,
  password: redisUrl.password,
  tls: redisUrl.protocol === "rediss:" ? {} : undefined,
};