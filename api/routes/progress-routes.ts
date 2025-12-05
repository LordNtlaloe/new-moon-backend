// routes/user-progress-routes.ts
import { Router } from "express";
import { UserProgressController } from "../controllers/progress-controller";
import userProgressRepository from "../../repository/progress-repository";
import { authMiddleware } from "../../middleware/auth-middleware";

const router = Router();
const userProgressController = new UserProgressController(userProgressRepository);

// All routes require authentication
router.use(authMiddleware);

// User progress routes
router.get("/", userProgressController.getUserProgress.bind(userProgressController));
router.get("/stats", userProgressController.getProgressStats.bind(userProgressController));
router.get("/completed", userProgressController.getCompletedWorkouts.bind(userProgressController));
router.post("/", userProgressController.createUserProgress.bind(userProgressController));
router.put("/:id", userProgressController.updateUserProgress.bind(userProgressController));
router.delete("/:id", userProgressController.deleteUserProgress.bind(userProgressController));

export default router;