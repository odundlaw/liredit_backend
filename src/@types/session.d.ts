import { User } from "../entities/user.entities";

declare module "express-session" {
  interface SessionData {
    user: Partial<User>;
  }
}
