import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const router = Router();

router.post("/register", (req, res) => userController.register(req, res));
router.post("/login", (req, res) => userController.login(req, res));
router.get("/refresh", (req, res) => userController.refresh(req, res));
router.post("/logout", (req, res) => userController.logout(req, res));

export default router;
