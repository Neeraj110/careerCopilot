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


export default router;
