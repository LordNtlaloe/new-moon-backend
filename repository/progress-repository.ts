// repository/user-progress-repository.ts
import { PrismaClient, UserProgress } from "@prisma/client";
import UserProgressRepository, { CreateUserProgressData, ProgressFilters, UpdateUserProgressData } from "./interfaces/ProgressRepository";

const prisma = new PrismaClient();

export const createUserProgress = async (data: CreateUserProgressData): Promise<UserProgress> => {
    try {
        return await prisma.userProgress.create({
            data: {
                userId: data.userId,
                workoutId: data.workoutId,
                exerciseId: data.exerciseId,
                completed: data.completed || false,
                progress: data.progress,
                duration: data.duration,
                caloriesBurned: data.caloriesBurned,
                startedAt: data.startedAt,
                completedAt: data.completedAt,
            },
            include: {
                user: true,
                workout: true,
                exercise: true
            }
        });
    } catch (error: any) {
        console.error("Error creating user progress:", error);
        throw new Error("Failed to create user progress");
    }
};

export const getUserProgressById = async (id: string): Promise<UserProgress | null> => {
    try {
        return await prisma.userProgress.findUnique({
            where: { id },
            include: {
                user: true,
                workout: true,
                exercise: true
            }
        });
    } catch (error: any) {
        console.error("Error fetching user progress:", error);
        throw new Error("Failed to get user progress");
    }
};

export const getUserProgress = async (filters: ProgressFilters): Promise<UserProgress[]> => {
    try {
        const where: any = {
            userId: filters.userId
        };

        if (filters.workoutId) {
            where.workoutId = filters.workoutId;
        }

        if (filters.exerciseId) {
            where.exerciseId = filters.exerciseId;
        }

        if (filters.completed !== undefined) {
            where.completed = filters.completed;
        }

        if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
            if (filters.dateTo) where.createdAt.lte = filters.dateTo;
        }

        return await prisma.userProgress.findMany({
            where,
            include: {
                workout: true,
                exercise: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching user progress by filters:", error);
        throw new Error("Failed to get user progress by filters");
    }
};

export const updateUserProgress = async (id: string, data: UpdateUserProgressData): Promise<UserProgress> => {
    try {
        return await prisma.userProgress.update({
            where: { id },
            data,
            include: {
                user: true,
                workout: true,
                exercise: true
            }
        });
    } catch (error: any) {
        console.error("Error updating user progress:", error);
        throw new Error("Failed to update user progress");
    }
};

export const deleteUserProgress = async (id: string): Promise<UserProgress> => {
    try {
        return await prisma.userProgress.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting user progress:", error);
        throw new Error("Failed to delete user progress");
    }
};

export const getUserWorkoutProgress = async (userId: string, workoutId: string): Promise<UserProgress[]> => {
    try {
        return await prisma.userProgress.findMany({
            where: {
                userId,
                workoutId
            },
            include: {
                exercise: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching user workout progress:", error);
        throw new Error("Failed to get user workout progress");
    }
};

export const getCompletedWorkouts = async (userId: string): Promise<UserProgress[]> => {
    try {
        return await prisma.userProgress.findMany({
            where: {
                userId,
                completed: true,
                exerciseId: null // Only workout completions, not individual exercises
            },
            include: {
                workout: true
            },
            orderBy: { completedAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching completed workouts:", error);
        throw new Error("Failed to get completed workouts");
    }
};

export const getProgressStats = async (userId: string): Promise<any> => {
    try {
        const [totalWorkouts, completedWorkouts, totalDuration, totalCalories] = await Promise.all([
            prisma.userProgress.count({
                where: { userId, exerciseId: null }
            }),
            prisma.userProgress.count({
                where: { userId, completed: true, exerciseId: null }
            }),
            prisma.userProgress.aggregate({
                where: { userId },
                _sum: { duration: true }
            }),
            prisma.userProgress.aggregate({
                where: { userId },
                _sum: { caloriesBurned: true }
            })
        ]);

        return {
            totalWorkouts,
            completedWorkouts,
            completionRate: totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0,
            totalDuration: totalDuration._sum.duration || 0,
            totalCalories: totalCalories._sum.caloriesBurned || 0,
            averageProgress: await prisma.userProgress.aggregate({
                where: { userId, progress: { not: null } },
                _avg: { progress: true }
            }).then(result => result._avg.progress || 0)
        };
    } catch (error: any) {
        console.error("Error fetching progress stats:", error);
        throw new Error("Failed to get progress stats");
    }
};

const userProgressRepository: UserProgressRepository = {
    createUserProgress,
    getUserProgressById,
    getUserProgress,
    updateUserProgress,
    deleteUserProgress,
    getUserWorkoutProgress,
    getCompletedWorkouts,
    getProgressStats,
};

export default userProgressRepository;