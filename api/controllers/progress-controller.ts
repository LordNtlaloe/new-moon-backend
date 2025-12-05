// controllers/user-progress-controller.ts
import { Request, Response, NextFunction } from "express";
import UserProgressRepository from "../../repository/interfaces/ProgressRepository";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import * as userProgressBusiness from "../../domain/progress-business";

export class UserProgressController {
    constructor(private userProgressRepository: UserProgressRepository) { }

    async createUserProgress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const {
                workoutId,
                exerciseId,
                completed,
                progress,
                duration,
                caloriesBurned
            } = req.body;

            const userId = req.user!.userId;

            if (!workoutId) {
                throw new ErrorHandler(400, "Workout ID is required");
            }

            const progressData = {
                userId,
                workoutId,
                exerciseId,
                completed: completed || false,
                progress: progress ? parseFloat(progress) : undefined,
                duration: duration ? parseInt(duration) : undefined,
                caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
                startedAt: new Date(),
                completedAt: completed ? new Date() : undefined,
            };

            const userProgress = await userProgressBusiness.createUserProgress(
                this.userProgressRepository,
                progressData
            );

            res.status(201).json({
                success: true,
                payload: { userProgress },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getUserProgress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const { workoutId, exerciseId, completed, dateFrom, dateTo } = req.query;

            const filters = {
                userId,
                workoutId: workoutId as string,
                exerciseId: exerciseId as string,
                completed: completed ? completed === 'true' : undefined,
                dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
                dateTo: dateTo ? new Date(dateTo as string) : undefined,
            };

            const progress = await userProgressBusiness.getUserProgress(
                this.userProgressRepository,
                filters
            );

            res.json({
                success: true,
                payload: { progress },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateUserProgress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { completed, progress, duration, caloriesBurned } = req.body;

            const updateData = {
                completed,
                progress: progress ? parseFloat(progress) : undefined,
                duration: duration ? parseInt(duration) : undefined,
                caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : undefined,
                completedAt: completed ? new Date() : undefined,
            };

            const userProgress = await userProgressBusiness.updateUserProgress(
                this.userProgressRepository,
                id,
                updateData
            );

            res.json({
                success: true,
                payload: { userProgress },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getProgressStats(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const stats = await userProgressBusiness.getProgressStats(
                this.userProgressRepository,
                userId
            );

            res.json({
                success: true,
                payload: { stats },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getCompletedWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const workouts = await userProgressBusiness.getCompletedWorkouts(
                this.userProgressRepository,
                userId
            );

            res.json({
                success: true,
                payload: { workouts },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async deleteUserProgress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const userProgress = await userProgressBusiness.deleteUserProgress(
                this.userProgressRepository,
                id
            );

            res.json({
                success: true,
                payload: { userProgress },
                message: "Progress record deleted successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }
}