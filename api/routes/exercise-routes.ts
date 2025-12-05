// routes/exercise-routes.ts
import { Router } from "express";
import { ExerciseController } from "../controllers/exercise-controller";
import exerciseRepository from "../../repository/exercise-repository";
import { authMiddleware, requireRole } from "../../middleware/auth-middleware";

const router = Router();
const exerciseController = new ExerciseController(exerciseRepository);

// Public routes
router.get("/", exerciseController.getAllExercises.bind(exerciseController));
router.get("/:id", exerciseController.getExercise.bind(exerciseController));

// Authenticated routes
router.use(authMiddleware);
router.get("/tier/:tier", exerciseController.getExercisesByTier.bind(exerciseController));

// Admin only routes
router.post("/", requireRole(['ADMIN', 'TRAINER']), exerciseController.createExercise.bind(exerciseController));
router.put("/:id", requireRole(['ADMIN', 'TRAINER']), exerciseController.updateExercise.bind(exerciseController));
router.delete("/:id", requireRole(['ADMIN', 'TRAINER']), exerciseController.deleteExercise.bind(exerciseController));

export default router;