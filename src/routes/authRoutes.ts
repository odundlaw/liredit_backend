import { Application, Request, Response } from "express";
import { google, googleCallback } from "../controllers/authController";

export const authRoutes = (app: Application) => {
  app.get("/api/auth/google", google());

  app.get("/api/auth/google/callback", (req: Request, res: Response) => {
    googleCallback(req, res);
  });
};
