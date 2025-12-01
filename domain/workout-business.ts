import { WorkoutRepository } from "../repository/interfaces/WorkoutRepository";
import { MembershipTier, ExerciseDifficulty, WorkoutType, Workout } from "@prisma/client";

// Update the interface to be compatible with Prisma types
export interface WorkoutWithProgress {
    id: string;
    title: string;
    description?: string | null; // Change from string | undefined to string | null
    type: WorkoutType;
    duration: number;
    totalCalories: number;
    image?: string | null; // Change from string | undefined to string | null
    requiredTier: MembershipTier;
    isPremium: boolean;
    progress?: number;
    completed?: boolean;
}

// Helper function to convert Prisma Workout to WorkoutWithProgress
const convertWorkoutToWorkoutWithProgress = (workout: Workout, progress: number = 0, completed: boolean = false): WorkoutWithProgress => {
    return {
        id: workout.id,
        title: workout.title,
        description: workout.description,
        type: workout.type,
        duration: workout.duration,
        totalCalories: workout.totalCalories,
        image: workout.image,
        requiredTier: workout.requiredTier,
        isPremium: workout.isPremium,
        progress,
        completed
    };
};

export const getAvailableWorkouts = async (
    workoutRepository: WorkoutRepository,
    userTier: MembershipTier
): Promise<WorkoutWithProgress[]> => {
    try {
        const workouts = await workoutRepository.getWorkoutsByTier(userTier);

        // For free tier users, limit to only FREE tier workouts and limit count
        if (userTier === 'FREE') {
            const freeWorkouts = workouts.filter(workout =>
                workout.requiredTier === 'FREE'
            ).slice(0, 5); // Limit to 5 workouts for free users

            return freeWorkouts.map(workout =>
                convertWorkoutToWorkoutWithProgress(workout, 0, false)
            );
        }

        return workouts.map(workout =>
            convertWorkoutToWorkoutWithProgress(workout, 0, false)
        );
    } catch (error: any) {
        console.error("Error getting available workouts:", error);
        throw error;
    }
};

export const getTrendingWorkoutsForUser = async (
    workoutRepository: WorkoutRepository,
    userTier: MembershipTier,
    userId?: string
): Promise<WorkoutWithProgress[]> => {
    try {
        const workouts = await workoutRepository.getTrendingWorkouts(userTier, 3);

        const workoutsWithProgress: WorkoutWithProgress[] = [];

        for (const workout of workouts) {
            let progress = 0;
            let completed = false;

            if (userId) {
                const userProgress = await workoutRepository.getUserProgress(userId, workout.id);
                progress = userProgress?.progress || 0;
                completed = userProgress?.completed || false;
            }

            workoutsWithProgress.push(
                convertWorkoutToWorkoutWithProgress(workout, progress, completed)
            );
        }

        return workoutsWithProgress;
    } catch (error: any) {
        console.error("Error getting trending workouts:", error);
        throw error;
    }
};

export const getWorkoutsByTypeForUser = async (
    workoutRepository: WorkoutRepository,
    type: WorkoutType,
    userTier: MembershipTier,
    userId?: string
): Promise<WorkoutWithProgress[]> => {
    try {
        const workouts = await workoutRepository.getWorkoutsByType(type, userTier);

        const workoutsWithProgress: WorkoutWithProgress[] = [];

        for (const workout of workouts) {
            let progress = 0;
            let completed = false;

            if (userId) {
                const userProgress = await workoutRepository.getUserProgress(userId, workout.id);
                progress = userProgress?.progress || 0;
                completed = userProgress?.completed || false;
            }

            workoutsWithProgress.push(
                convertWorkoutToWorkoutWithProgress(workout, progress, completed)
            );
        }

        return workoutsWithProgress;
    } catch (error: any) {
        console.error("Error getting workouts by type:", error);
        throw error;
    }
};

export const getTodayWorkoutsWithProgress = async (
    workoutRepository: WorkoutRepository,
    userId: string,
    userTier: MembershipTier
): Promise<WorkoutWithProgress[]> => {
    try {
        const todayWorkouts = await workoutRepository.getTodayWorkouts(userId);

        const workoutsWithProgress: WorkoutWithProgress[] = [];

        for (const workout of todayWorkouts) {
            const userProgress = await workoutRepository.getUserProgress(userId, workout.id);

            workoutsWithProgress.push(
                convertWorkoutToWorkoutWithProgress(
                    workout,
                    userProgress?.progress || 0,
                    userProgress?.completed || false
                )
            );
        }

        // If no workouts for today, suggest some based on user tier
        if (workoutsWithProgress.length === 0) {
            const suggestedWorkouts = await workoutRepository.getTrendingWorkouts(userTier, 3);
            return suggestedWorkouts.map(workout =>
                convertWorkoutToWorkoutWithProgress(workout, 0, false)
            );
        }

        return workoutsWithProgress;
    } catch (error: any) {
        console.error("Error getting today's workouts:", error);
        throw error;
    }
};

export const updateWorkoutProgress = async (
    workoutRepository: WorkoutRepository,
    userId: string,
    workoutId: string,
    progress: number,
    completed: boolean = false
): Promise<void> => {
    try {
        await workoutRepository.updateUserProgress(userId, workoutId, {
            progress,
            completed,
            completedAt: completed ? new Date() : undefined
        });
    } catch (error: any) {
        console.error("Error updating workout progress:", error);
        throw error;
    }
};

export default {
    getAvailableWorkouts,
    getTrendingWorkoutsForUser,
    getWorkoutsByTypeForUser,
    getTodayWorkoutsWithProgress,
    updateWorkoutProgress
};