// routes/workout-routes.ts
import { Router } from "express";
import { WorkoutController } from "../controllers/workout-controller";
import workoutRepository from "../../repository/workout-repository";
import { authMiddleware, requireRole } from "../../middleware/auth-middleware";

const router = Router();
const workoutController = new WorkoutController(workoutRepository);

// Public routes
router.get("/", workoutController.getAllWorkouts.bind(workoutController));
router.get("/:id", workoutController.getWorkout.bind(workoutController));

// Authenticated routes
router.use(authMiddleware);
router.get("/tier/:tier", workoutController.getWorkoutsByTier.bind(workoutController));

// Admin/Trainer only routes
router.post("/", requireRole(['ADMIN', 'TRAINER']), workoutController.createWorkout.bind(workoutController));
router.put("/:id", requireRole(['ADMIN', 'TRAINER']), workoutController.updateWorkout.bind(workoutController));
router.delete("/:id", requireRole(['ADMIN', 'TRAINER']), workoutController.deleteWorkout.bind(workoutController));
router.post("/:workoutId/exercises/:exerciseId", requireRole(['ADMIN', 'TRAINER']), workoutController.addExerciseToWorkout.bind(workoutController));

export default router;