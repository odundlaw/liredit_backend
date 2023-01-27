import { Request, Response } from "express";
import passport from "passport";
import dotenv from "dotenv";

dotenv.config();

const clientBaseUrl = process.env.CLIENT_BASE_URL!;

export const google = () => {
  return passport.authenticate("google", {
    scope: ["email", "profile"],
    prompt: "select_account",
  });
};

export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate("google", function (error, user, info) {
    if ((info && Object.keys(info).length) || error) {
      return res.redirect(
        `${clientBaseUrl}/login?redirect=fail&error=${encodeURIComponent(
          info.message
        )}`
      );
    }
    req.login(user, function (err) {
      if (err) console.log(err);
      if (user) {
        req.session.user = { username: user.username, id: user.id };
        console.log(clientBaseUrl);
        return res.redirect(`${clientBaseUrl}`);
      }
    });
  })(req, res);
};
