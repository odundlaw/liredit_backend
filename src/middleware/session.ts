import session from "express-session";
import RedisConnect from "connect-redis";
import { Application } from "express";
import { redisServer } from "../utils/redisClient";
import { COOKIE_NAME, __prod__ } from "../constants";

export const sessionMiddleware = (app: Application) => {
  let RedisStore = RedisConnect(session);

  app.use(
    session({
      saveUninitialized: false,
      name: COOKIE_NAME,
      resave: false,
      secret: "fl_qIMlytZcEwgr1pKODDJ_lMAJNnHxl",
      cookie: {
        signed: false,
        secure: __prod__,
        sameSite: "lax",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 100 * 365,
      },
      store: new RedisStore({
        client: redisServer.getConnect() as any,
        disableTouch: true,
      }),
    })
  );
};
