import dotenv from "dotenv";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import { User } from "../entities/user.entities";
import { DI } from "../index";
import logger from "./logger";
dotenv.config();

passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_REDIRECT_URI as string,
    },

    async function (_, __, profile, done) {
      const email = profile.emails?.[0].value;
      const username = profile.username;
      const fullName = profile.name
        ? Object.values(profile.name).join(" ")
        : profile.displayName;
      try {
        const userRepo = DI.dataSource.getRepository(User);
        const existingUser = await userRepo.findOne({
          where: { email: email },
        });

        if (!existingUser) {
          const createUser = await DI.dataSource
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
              email: email,
              name: fullName,
              username: username,
              password: "DEFAULT PASSWORD",
            })
            .returning("*")
            .execute();

          if (!createUser.raw[0]) {
            return done(null, false, { message: "Unable to create User" });
          }
          return done(null, createUser.raw[0]);
        } else {
          return done(null, existingUser);
        }
      } catch (err) {
        return done(null, false, { message: "Unable to perform Operation" });
      }
    }
  )
);

passport.serializeUser((user: Partial<User>, done: any) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done: any) => {
  try {
    const UserRep = DI.dataSource.getRepository(User);
    const singleUser = await UserRep.findOne({ where: { id: id } });
    if (!singleUser) {
      logger.error("Passport serialization error");
      return;
    }

    done("No user found", singleUser);
  } catch (err) {
    logger.error("Passport serialization error");
  }
});
