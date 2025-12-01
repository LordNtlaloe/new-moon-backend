import { Router } from "express";
import { WorkoutController } from "../controllers/workout-controller";
import workoutRepository from "../../repository/workout-repository";
import { authMiddleware } from "../../middleware/auth-middleware";

const router = Router();
const workoutController = new WorkoutController(workoutRepository);

// All routes are protected
router.use(authMiddleware);

// Workout routes
router.get("/available", (req, res, next) => workoutController.getAvailableWorkouts(req, res, next));
router.get("/trending", (req, res, next) => workoutController.getTrendingWorkouts(req, res, next));
router.get("/today", (req, res, next) => workoutController.getTodayWorkouts(req, res, next));
router.get("/type/:type", (req, res, next) => workoutController.getWorkoutsByType(req, res, next));
router.get("/:id", (req, res, next) => workoutController.getWorkoutDetails(req, res, next));
router.put("/:id/progress", (req, res, next) => workoutController.updateWorkoutProgress(req, res, next));

// Membership info
router.get("/membership/info", (req, res, next) => workoutController.getUserMembershipInfo(req, res, next));

export default router;