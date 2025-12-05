// controllers/exercise-controller.ts
import { Request, Response, NextFunction } from "express";
import ExerciseRepository from "../../repository/interfaces/ExerciseRepository";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import * as exerciseBusiness from "../../domain/exercise-business";
import { ExerciseDifficulty, MembershipTier } from "@prisma/client";

export class ExerciseController {
    constructor(private exerciseRepository: ExerciseRepository) { }

    async createExercise(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const {
                name,
                description,
                difficulty,
                duration,
                calories,
                image,
                videoUrl,
                instructions,
                requiredTier
            } = req.body;

            if (!name || !difficulty || !duration || !calories) {
                throw new ErrorHandler(400, "Name, difficulty, duration, and calories are required");
            }

            // Validate enum values
            if (!Object.values(ExerciseDifficulty).includes(difficulty)) {
                throw new ErrorHandler(400, "Invalid difficulty level");
            }

            if (requiredTier && !Object.values(MembershipTier).includes(requiredTier)) {
                throw new ErrorHandler(400, "Invalid required tier");
            }

            const exerciseData = {
                name,
                description,
                difficulty: difficulty as ExerciseDifficulty,
                duration: parseInt(duration),
                calories: parseInt(calories),
                image,
                videoUrl,
                instructions: typeof instructions === 'string' ? JSON.parse(instructions) : instructions,
                requiredTier: (requiredTier as MembershipTier) || MembershipTier.FREE,
            };

            const exercise = await exerciseBusiness.createExercise(
                this.exerciseRepository,
                exerciseData
            );

            res.status(201).json({
                success: true,
                payload: { exercise },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getAllExercises(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                difficulty,
                requiredTier,
                durationMin,
                durationMax,
                search
            } = req.query;

            // Cast query parameters to proper types with validation
            const filters: any = {};

            if (difficulty) {
                const difficultyStr = difficulty as string;
                if (Object.values(ExerciseDifficulty).includes(difficultyStr as ExerciseDifficulty)) {
                    filters.difficulty = difficultyStr as ExerciseDifficulty;
                }
            }

            if (requiredTier) {
                const tierStr = requiredTier as string;
                if (Object.values(MembershipTier).includes(tierStr as MembershipTier)) {
                    filters.requiredTier = tierStr as MembershipTier;
                }
            }

            if (durationMin) {
                filters.durationMin = parseInt(durationMin as string);
            }

            if (durationMax) {
                filters.durationMax = parseInt(durationMax as string);
            }

            if (search) {
                filters.search = search as string;
            }

            const exercises = await exerciseBusiness.getExercisesByFilters(
                this.exerciseRepository,
                filters
            );

            res.json({
                success: true,
                payload: { exercises },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getExercise(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const exercise = await exerciseBusiness.getExercise(
                this.exerciseRepository,
                id
            );

            if (!exercise) {
                throw new ErrorHandler(404, "Exercise not found");
            }

            res.json({
                success: true,
                payload: { exercise },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateExercise(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validate enum values if provided
            if (updateData.difficulty && !Object.values(ExerciseDifficulty).includes(updateData.difficulty)) {
                throw new ErrorHandler(400, "Invalid difficulty level");
            }

            if (updateData.requiredTier && !Object.values(MembershipTier).includes(updateData.requiredTier)) {
                throw new ErrorHandler(400, "Invalid required tier");
            }

            const exercise = await exerciseBusiness.updateExercise(
                this.exerciseRepository,
                id,
                updateData
            );

            res.json({
                success: true,
                payload: { exercise },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async deleteExercise(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const exercise = await exerciseBusiness.deleteExercise(
                this.exerciseRepository,
                id
            );

            res.json({
                success: true,
                payload: { exercise },
                message: "Exercise deleted successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getExercisesByTier(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tier } = req.params;
            const userTier = req.user?.membershipTier || MembershipTier.FREE;

            // Validate tier parameter
            if (!Object.values(MembershipTier).includes(tier as MembershipTier)) {
                throw new ErrorHandler(400, "Invalid tier");
            }

            // Users can only access exercises up to their tier
            const accessibleTiers: MembershipTier[] = [MembershipTier.FREE];

            // Use switch statement for proper type handling
            switch (userTier) {
                case MembershipTier.BASIC:
                case MembershipTier.PREMIUM:
                case MembershipTier.VIP:
                    accessibleTiers.push(MembershipTier.BASIC);
                    if (userTier === MembershipTier.BASIC) break;
                case MembershipTier.PREMIUM:
                case MembershipTier.VIP:
                    accessibleTiers.push(MembershipTier.PREMIUM);
                    if (userTier === MembershipTier.PREMIUM) break;
                case MembershipTier.VIP:
                    accessibleTiers.push(MembershipTier.VIP);
                    break;
            }

            const exercises = await exerciseBusiness.getExercisesByTier(
                this.exerciseRepository,
                tier as MembershipTier
            );

            // Filter based on user's access level
            const accessibleExercises = exercises.filter(exercise =>
                accessibleTiers.includes(exercise.requiredTier)
            );

            res.json({
                success: true,
                payload: { exercises: accessibleExercises },
            });
        } catch (error: any) {
            next(error);
        }
    }

    // Get exercises by difficulty
    async getExercisesByDifficulty(req: Request, res: Response, next: NextFunction) {
        try {
            const { difficulty } = req.params;

            // Validate difficulty parameter
            if (!Object.values(ExerciseDifficulty).includes(difficulty as ExerciseDifficulty)) {
                throw new ErrorHandler(400, "Invalid difficulty level");
            }

            const exercises = await this.exerciseRepository.getExercisesByFilters({
                difficulty: difficulty as ExerciseDifficulty
            });

            res.json({
                success: true,
                payload: { exercises },
            });
        } catch (error: any) {
            next(error);
        }
    }
}