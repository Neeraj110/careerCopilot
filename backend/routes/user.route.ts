import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticateTokens } from "../middlewares/twoTokenAuth.js";
import passport from "../libs/passport.js";

const router = Router();


router.post("/register", (req, res) => userController.register(req, res));
router.post("/login", (req, res) => userController.login(req, res));
router.get("/refresh", (req, res) => userController.refresh(req, res));
router.post("/change-password", authenticateTokens, (req, res) => userController.changePassword(req, res));

router.post("/logout", (req, res) => userController.logout(req, res));

// OAuth Routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/auth/callback/google",
  passport.authenticate("google", { session: false, failureRedirect: "/login?error=GoogleFailed" }),
  (req, res) => userController.oauthCallback(req, res)
);

router.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get(
  "/auth/callback/github",
  passport.authenticate("github", { session: false, failureRedirect: "/login?error=GitHubFailed" }),
  (req, res) => userController.oauthCallback(req, res)
);

export default router;
