import { createClient, RedisClientType } from "redis";
import logger from "../config/logger";

class RedisServer {
  client: RedisClientType;
  constructor() {
    this.client = createClient({ legacyMode: true });
    (async () => {
      this.client.on("error", (err: any) => {
        logger.error({ message: err.message, service: "Redis" });
      });
      this.client.on("ready", () => {
        logger.info({ message: "Connected Successfully", service: "Redis" });
      });
      await this.client.connect();
    })();
  }

  getConnect() {
    return this.client;
  }
}

export const redisServer = new RedisServer();
