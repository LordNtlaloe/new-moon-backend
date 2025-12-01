import { PrismaClient, ExerciseDifficulty, WorkoutType, MembershipTier, Exercise, UserProgress, Workout } from "@prisma/client";
import {
    WorkoutRepository,
    CreateExerciseData,
    CreateWorkoutData,
    UpdateProgressData
} from "./interfaces/WorkoutRepository";

const prisma = new PrismaClient();

// Helper function to get accessible tiers based on user tier
const getAccessibleTiers = (userTier: MembershipTier): MembershipTier[] => {
    const tierValues = {
        FREE: 0,
        BASIC: 1,
        PREMIUM: 2,
        VIP: 3
    };

    const userTierValue = tierValues[userTier];
    const allTiers: MembershipTier[] = ['FREE', 'BASIC', 'PREMIUM', 'VIP'];

    return allTiers.filter(tier => tierValues[tier] <= userTierValue);
};

export const getExercisesByDifficulty = async (
    difficulty: ExerciseDifficulty,
    tier: MembershipTier
): Promise<Exercise[]> => {
    try {
        const accessibleTiers = getAccessibleTiers(tier);

        return await prisma.exercise.findMany({
            where: {
                difficulty,
                requiredTier: { in: accessibleTiers }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching exercises by difficulty:", error);
        throw new Error("Failed to fetch exercises");
    }
};

export const getExerciseById = async (id: string): Promise<Exercise | null> => {
    try {
        return await prisma.exercise.findUnique({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error fetching exercise by ID:", error);
        throw new Error("Failed to fetch exercise");
    }
};

export const getWorkoutsByTier = async (tier: MembershipTier): Promise<Workout[]> => {
    try {
        const accessibleTiers = getAccessibleTiers(tier);

        return await prisma.workout.findMany({
            where: {
                requiredTier: { in: accessibleTiers }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching workouts by tier:", error);
        throw new Error("Failed to fetch workouts");
    }
};

export const getTrendingWorkouts = async (
    tier: MembershipTier,
    limit: number = 5
): Promise<Workout[]> => {
    try {
        const accessibleTiers = getAccessibleTiers(tier);

        return await prisma.workout.findMany({
            where: {
                requiredTier: { in: accessibleTiers }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    } catch (error: any) {
        console.error("Error fetching trending workouts:", error);
        throw new Error("Failed to fetch trending workouts");
    }
};

export const getWorkoutsByType = async (
    type: WorkoutType,
    tier: MembershipTier
): Promise<Workout[]> => {
    try {
        const accessibleTiers = getAccessibleTiers(tier);

        return await prisma.workout.findMany({
            where: {
                type,
                requiredTier: { in: accessibleTiers }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching workouts by type:", error);
        throw new Error("Failed to fetch workouts by type");
    }
};

export const getWorkoutById = async (id: string): Promise<Workout | null> => {
    try {
        return await prisma.workout.findUnique({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error fetching workout by ID:", error);
        throw new Error("Failed to fetch workout");
    }
};

export const getWorkoutWithExercises = async (
    id: string
): Promise<(Workout & { workoutExercises: { exercise: Exercise }[] }) | null> => {
    try {
        return await prisma.workout.findUnique({
            where: { id },
            include: {
                workoutExercises: {
                    include: {
                        exercise: true
                    },
                    orderBy: { order: 'asc' }
                }
            }
        });
    } catch (error: any) {
        console.error("Error fetching workout with exercises:", error);
        throw new Error("Failed to fetch workout details");
    }
};

export const getUserProgress = async (
    userId: string,
    workoutId: string,
    exerciseId?: string
): Promise<UserProgress | null> => {
    try {
        return await prisma.userProgress.findUnique({
            where: {
                userId_workoutId_exerciseId: {
                    userId,
                    workoutId,
                    exerciseId: exerciseId || '' // Use empty string for workout-only progress
                }
            }
        });
    } catch (error: any) {
        console.error("Error fetching user progress:", error);
        throw new Error("Failed to fetch user progress");
    }
};

export const updateUserProgress = async (
    userId: string,
    workoutId: string,
    data: UpdateProgressData,
    exerciseId?: string
): Promise<UserProgress> => {
    try {
        const upsertData: any = {
            userId,
            workoutId,
            exerciseId: exerciseId || '',
            completed: data.completed,
            progress: data.progress,
            duration: data.duration,
            caloriesBurned: data.caloriesBurned,
        };

        // Only set completedAt if completed is true
        if (data.completed) {
            upsertData.completedAt = data.completedAt || new Date();
        }

        // Set startedAt only for workout-level progress (no exerciseId) when starting
        if (!exerciseId && data.progress && data.progress > 0) {
            upsertData.startedAt = new Date();
        }

        return await prisma.userProgress.upsert({
            where: {
                userId_workoutId_exerciseId: {
                    userId,
                    workoutId,
                    exerciseId: exerciseId || ''
                }
            },
            update: upsertData,
            create: upsertData
        });
    } catch (error: any) {
        console.error("Error updating user progress:", error);
        throw new Error("Failed to update user progress");
    }
};

export const getUserWorkoutProgress = async (
    userId: string,
    workoutId: string
): Promise<UserProgress[]> => {
    try {
        return await prisma.userProgress.findMany({
            where: {
                userId,
                workoutId
            }
        });
    } catch (error: any) {
        console.error("Error fetching user workout progress:", error);
        throw new Error("Failed to fetch workout progress");
    }
};

export const getTodayWorkouts = async (userId: string): Promise<Workout[]> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get workouts that user has progress for today
        const progressRecords = await prisma.userProgress.findMany({
            where: {
                userId,
                createdAt: {
                    gte: today,
                    lt: tomorrow
                },
                exerciseId: '' // Workout-level progress
            },
            include: {
                workout: true
            }
        });

        return progressRecords.map(record => record.workout);
    } catch (error: any) {
        console.error("Error fetching today's workouts:", error);
        throw new Error("Failed to fetch today's workouts");
    }
};

// Repository export - includes all required methods from the interface
const workoutRepository: WorkoutRepository = {
    getExercisesByDifficulty,
    getExerciseById,
    getWorkoutsByTier,
    getTrendingWorkouts,
    getWorkoutsByType,
    getWorkoutById,
    getWorkoutWithExercises,
    getUserProgress,
    updateUserProgress,
    getUserWorkoutProgress,
    getTodayWorkouts
};

export default workoutRepository;