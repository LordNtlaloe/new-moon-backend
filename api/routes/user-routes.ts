import { Router } from "express";
import { AuthController } from "../controllers/user-controller";
import userRepository from "../../repository/user-repository";
import { authMiddleware } from "../../middleware/auth-middleware";

const router = Router();
const authController = new AuthController(userRepository);

// Public routes
router.post("/register", (req, res, next) => authController.register(req, res, next));
router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/refresh-token", (req, res, next) => authController.refreshToken(req, res, next));

// Protected routes
router.get("/me", authMiddleware, (req, res, next) => authController.getCurrentUser(req, res, next));
router.post("/logout", authMiddleware, (req, res, next) => authController.logout(req, res, next));

export default router;