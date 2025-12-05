// controllers/workout-controller.ts
import { Request, Response, NextFunction } from "express";
import WorkoutRepository from "../../repository/interfaces/WorkoutRepository";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import * as workoutBusiness from "../../domain/workout-business";
import { WorkoutType, MembershipTier } from "@prisma/client";

export class WorkoutController {
    constructor(private workoutRepository: WorkoutRepository) { }

    async createWorkout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const {
                title,
                description,
                type,
                duration,
                totalCalories,
                image,
                requiredTier,
                isPremium,
                exercises
            } = req.body;

            if (!title || !type || !duration || !totalCalories) {
                throw new ErrorHandler(400, "Title, type, duration, and total calories are required");
            }

            // Validate enum values
            if (!Object.values(WorkoutType).includes(type)) {
                throw new ErrorHandler(400, "Invalid workout type");
            }

            if (requiredTier && !Object.values(MembershipTier).includes(requiredTier)) {
                throw new ErrorHandler(400, "Invalid required tier");
            }

            const workoutData = {
                title,
                description,
                type: type as WorkoutType,
                duration: parseInt(duration),
                totalCalories: parseInt(totalCalories),
                image,
                requiredTier: (requiredTier as MembershipTier) || MembershipTier.FREE,
                isPremium: isPremium || false,
            };

            const workout = await workoutBusiness.createWorkout(
                this.workoutRepository,
                workoutData,
                exercises
            );

            res.status(201).json({
                success: true,
                payload: { workout },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getAllWorkouts(req: Request, res: Response, next: NextFunction) {
        try {
            const {
                type,
                requiredTier,
                isPremium,
                durationMin,
                durationMax,
                search
            } = req.query;

            // Cast query parameters to proper types with validation
            const filters: any = {};

            if (type) {
                const typeStr = type as string;
                if (Object.values(WorkoutType).includes(typeStr as WorkoutType)) {
                    filters.type = typeStr as WorkoutType;
                }
            }

            if (requiredTier) {
                const tierStr = requiredTier as string;
                if (Object.values(MembershipTier).includes(tierStr as MembershipTier)) {
                    filters.requiredTier = tierStr as MembershipTier;
                }
            }

            if (isPremium !== undefined) {
                filters.isPremium = isPremium === 'true';
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

            const workouts = await workoutBusiness.getWorkoutsByFilters(
                this.workoutRepository,
                filters
            );

            res.json({
                success: true,
                payload: { workouts },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getWorkout(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const workout = await workoutBusiness.getWorkout(
                this.workoutRepository,
                id
            );

            if (!workout) {
                throw new ErrorHandler(404, "Workout not found");
            }

            res.json({
                success: true,
                payload: { workout },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateWorkout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validate enum values if provided
            if (updateData.type && !Object.values(WorkoutType).includes(updateData.type)) {
                throw new ErrorHandler(400, "Invalid workout type");
            }

            if (updateData.requiredTier && !Object.values(MembershipTier).includes(updateData.requiredTier)) {
                throw new ErrorHandler(400, "Invalid required tier");
            }

            const workout = await workoutBusiness.updateWorkout(
                this.workoutRepository,
                id,
                updateData
            );

            res.json({
                success: true,
                payload: { workout },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async deleteWorkout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const workout = await workoutBusiness.deleteWorkout(
                this.workoutRepository,
                id
            );

            res.json({
                success: true,
                payload: { workout },
                message: "Workout deleted successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getWorkoutsByTier(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tier } = req.params;
            const userTier = req.user?.membershipTier || MembershipTier.FREE;

            // Validate tier parameter
            if (!Object.values(MembershipTier).includes(tier as MembershipTier)) {
                throw new ErrorHandler(400, "Invalid tier");
            }

            // Users can only access workouts up to their tier
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

            const workouts = await workoutBusiness.getWorkoutsByTier(
                this.workoutRepository,
                tier as MembershipTier
            );

            // Filter based on user's access level and premium status
            const accessibleWorkouts = workouts.filter(workout =>
                accessibleTiers.includes(workout.requiredTier) &&
                (!workout.isPremium || userTier !== MembershipTier.FREE)
            );

            res.json({
                success: true,
                payload: { workouts: accessibleWorkouts },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async addExerciseToWorkout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { workoutId, exerciseId } = req.params;
            const { order, sets, reps, duration } = req.body;

            if (!order) {
                throw new ErrorHandler(400, "Order is required");
            }

            const workoutExercise = await workoutBusiness.addExerciseToWorkout(
                this.workoutRepository,
                workoutId,
                exerciseId,
                parseInt(order),
                sets ? parseInt(sets) : undefined,
                reps ? parseInt(reps) : undefined,
                duration ? parseInt(duration) : undefined
            );

            res.status(201).json({
                success: true,
                payload: { workoutExercise },
            });
        } catch (error: any) {
            next(error);
        }
    }

    // Add trending workouts endpoint
    async getTrendingWorkouts(req: Request, res: Response, next: NextFunction) {
        try {
            // Get popular workouts (you might want to implement logic based on views, likes, etc.)
            const workouts = await this.workoutRepository.getWorkoutsByFilters({
                isPremium: false, // Show free workouts as trending by default
                durationMin: 5,
                durationMax: 30
            });

            // Limit to 6 workouts
            const trendingWorkouts = workouts.slice(0, 6);

            res.json({
                success: true,
                payload: { workouts: trendingWorkouts },
            });
        } catch (error: any) {
            next(error);
        }
    }

    // Add today's recommended workouts endpoint
    async getTodayWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const userTier = req.user?.membershipTier || MembershipTier.FREE;

            // Get accessible workouts for the user's tier
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

            const filters = {
                requiredTier: { in: accessibleTiers },
                isPremium: userTier === MembershipTier.FREE ? false : undefined
            };

            const allWorkouts = await this.workoutRepository.getWorkoutsByFilters(filters);
            
            // Simple algorithm: recommend 2-3 workouts per day
            // You could implement more complex logic based on user history, preferences, etc.
            const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
            const dayTypes: WorkoutType[] = [
                WorkoutType.CARDIO,    // Sunday
                WorkoutType.STRENGTH,  // Monday
                WorkoutType.HIIT,      // Tuesday
                WorkoutType.YOGA,      // Wednesday
                WorkoutType.STRENGTH,  // Thursday
                WorkoutType.CARDIO,    // Friday
                WorkoutType.FLEXIBILITY // Saturday
            ];
            
            const todayType = dayTypes[dayOfWeek];
            const todayWorkouts = allWorkouts
                .filter(workout => workout.type === todayType)
                .slice(0, 3);

            res.json({
                success: true,
                payload: { workouts: todayWorkouts },
            });
        } catch (error: any) {
            next(error);
        }
    }

    // Add membership info endpoint
    async getMembershipInfo(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userTier = req.user?.membershipTier || MembershipTier.FREE;
            
            // Get all workouts grouped by tier
            const allWorkouts = await this.workoutRepository.getAllWorkouts();
            
            // Count workouts by tier
            const workoutCounts = {
                [MembershipTier.FREE]: 0,
                [MembershipTier.BASIC]: 0,
                [MembershipTier.PREMIUM]: 0,
                [MembershipTier.VIP]: 0,
            };

            allWorkouts.forEach(workout => {
                if (workout.requiredTier in workoutCounts) {
                    workoutCounts[workout.requiredTier as MembershipTier]++;
                }
            });

            // Calculate accessible workouts based on user's tier
            let accessibleWorkouts = 0;
            if (userTier === MembershipTier.FREE) {
                accessibleWorkouts = workoutCounts[MembershipTier.FREE];
            } else if (userTier === MembershipTier.BASIC) {
                accessibleWorkouts = workoutCounts[MembershipTier.FREE] + workoutCounts[MembershipTier.BASIC];
            } else if (userTier === MembershipTier.PREMIUM) {
                accessibleWorkouts = workoutCounts[MembershipTier.FREE] + workoutCounts[MembershipTier.BASIC] + workoutCounts[MembershipTier.PREMIUM];
            } else if (userTier === MembershipTier.VIP) {
                accessibleWorkouts = Object.values(workoutCounts).reduce((a, b) => a + b, 0);
            }

            const totalWorkouts = Object.values(workoutCounts).reduce((a, b) => a + b, 0);

            res.json({
                success: true,
                payload: {
                    info: {
                        currentTier: userTier,
                        workoutAccess: workoutCounts,
                        totalWorkouts,
                        accessibleWorkouts,
                    }
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    // Get workouts by type
    async getWorkoutsByType(req: Request, res: Response, next: NextFunction) {
        try {
            const { type } = req.params;
            
            // Validate type parameter
            if (!Object.values(WorkoutType).includes(type as WorkoutType)) {
                throw new ErrorHandler(400, "Invalid workout type");
            }

            const workouts = await this.workoutRepository.getWorkoutsByFilters({
                type: type as WorkoutType,
                isPremium: false // Show free workouts by default
            });

            res.json({
                success: true,
                payload: { workouts },
            });
        } catch (error: any) {
            next(error);
        }
    }

    // Get available workouts for user
    async getAvailableWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userTier = req.user?.membershipTier || MembershipTier.FREE;

            // Get accessible workouts for the user's tier
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

            const filters = {
                requiredTier: { in: accessibleTiers },
                isPremium: userTier === MembershipTier.FREE ? false : undefined
            };

            const workouts = await this.workoutRepository.getWorkoutsByFilters(filters);

            res.json({
                success: true,
                payload: { workouts },
            });
        } catch (error: any) {
            next(error);
        }
    }
}