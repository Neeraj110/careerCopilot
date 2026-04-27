import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import passport from "../libs/passport.js";

const router = Router();

// OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/callback/google",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=GoogleFailed" }),
  (req, res) => userController.oauthCallback(req, res)
);

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get(
  "/callback/github",
  passport.authenticate("github", { session: false, failureRedirect: "/login?error=GitHubFailed" }),
  (req, res) => userController.oauthCallback(req, res)
);

export default router;
