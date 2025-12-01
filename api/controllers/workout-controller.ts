import { Request, Response, NextFunction } from "express";
import { WorkoutRepository } from "../../repository/interfaces/WorkoutRepository";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import workoutBusiness, { WorkoutWithProgress } from "../../domain/workout-business";
import { WorkoutType, MembershipTier } from "@prisma/client";

export class WorkoutController {
    constructor(private workoutRepository: WorkoutRepository) { }

    async getAvailableWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Get user tier from the authenticated user
            const user = await this.getUserFromRequest(req);
            const userTier = user?.membershipTier || MembershipTier.FREE;
            const userId = user?.id;

            const workouts = await workoutBusiness.getAvailableWorkouts(
                this.workoutRepository,
                userTier
            );

            res.json({
                success: true,
                payload: workouts
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getTrendingWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.getUserFromRequest(req);
            const userTier = user?.membershipTier || MembershipTier.FREE;
            const userId = user?.id;

            const workouts = await workoutBusiness.getTrendingWorkoutsForUser(
                this.workoutRepository,
                userTier,
                userId
            );

            res.json({
                success: true,
                payload: workouts
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getWorkoutsByType(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { type } = req.params;
            const user = await this.getUserFromRequest(req);
            const userTier = user?.membershipTier || MembershipTier.FREE;
            const userId = user?.id;

            if (!Object.values(WorkoutType).includes(type as WorkoutType)) {
                throw new ErrorHandler(400, "Invalid workout type");
            }

            const workouts = await workoutBusiness.getWorkoutsByTypeForUser(
                this.workoutRepository,
                type as WorkoutType,
                userTier,
                userId
            );

            res.json({
                success: true,
                payload: workouts
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getTodayWorkouts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.getUserFromRequest(req);
            const userId = user?.id;
            const userTier = user?.membershipTier || MembershipTier.FREE;

            if (!userId) {
                throw new ErrorHandler(401, "User ID required");
            }

            const workouts = await workoutBusiness.getTodayWorkoutsWithProgress(
                this.workoutRepository,
                userId,
                userTier
            );

            res.json({
                success: true,
                payload: workouts
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getWorkoutDetails(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await this.getUserFromRequest(req);
            const userTier = user?.membershipTier || MembershipTier.FREE;

            const workout = await this.workoutRepository.getWorkoutWithExercises(id);

            if (!workout) {
                throw new ErrorHandler(404, "Workout not found");
            }

            // Check if user has access to this workout
            const userTierValue = this.getTierValue(userTier);
            const workoutTierValue = this.getTierValue(workout.requiredTier);

            if (workoutTierValue > userTierValue) {
                throw new ErrorHandler(403, "Upgrade your membership to access this workout");
            }

            res.json({
                success: true,
                payload: workout
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateWorkoutProgress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { progress, completed } = req.body;
            const user = await this.getUserFromRequest(req);
            const userId = user?.id;

            if (!userId) {
                throw new ErrorHandler(401, "User ID required");
            }

            await workoutBusiness.updateWorkoutProgress(
                this.workoutRepository,
                userId,
                id,
                progress,
                completed
            );

            res.json({
                success: true,
                message: "Progress updated successfully"
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getUserMembershipInfo(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.getUserFromRequest(req);
            const userTier = user?.membershipTier || MembershipTier.FREE;
            const membershipStatus = user?.membershipStatus;

            // Get workout counts by tier to show what's available
            const allWorkouts = await this.workoutRepository.getWorkoutsByTier(MembershipTier.VIP); // Get all
            const freeWorkouts = allWorkouts.filter(w => w.requiredTier === MembershipTier.FREE).length;
            const basicWorkouts = allWorkouts.filter(w => w.requiredTier === MembershipTier.BASIC).length;
            const premiumWorkouts = allWorkouts.filter(w => w.requiredTier === MembershipTier.PREMIUM).length;
            const vipWorkouts = allWorkouts.filter(w => w.requiredTier === MembershipTier.VIP).length;

            res.json({
                success: true,
                payload: {
                    currentTier: userTier,
                    membershipStatus,
                    workoutAccess: {
                        free: freeWorkouts,
                        basic: basicWorkouts,
                        premium: premiumWorkouts,
                        vip: vipWorkouts
                    },
                    limitations: userTier === MembershipTier.FREE ? {
                        maxWorkouts: 5,
                        beginnerOnly: true,
                        noPremiumContent: true
                    } : null
                }
            });
        } catch (error: any) {
            next(error);
        }
    }

    // Helper method to get user from request
    private async getUserFromRequest(req: AuthRequest) {
        if (!req.user) {
            throw new ErrorHandler(401, "Authentication required");
        }

        // You'll need to import your user repository
        const userRepository = require("../../repository/user-repository").default;
        const user = await userRepository.getUserById(req.user.userId);

        if (!user) {
            throw new ErrorHandler(404, "User not found");
        }

        return user;
    }

    // Helper method to convert tier to numeric value for comparison
    private getTierValue(tier: MembershipTier): number {
        const tierValues = {
            FREE: 0,
            BASIC: 1,
            PREMIUM: 2,
            VIP: 3
        };
        return tierValues[tier];
    }
}