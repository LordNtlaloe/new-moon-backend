// domain/user-progress-business.ts
import UserProgressRepository, { CreateUserProgressData, ProgressFilters, UpdateUserProgressData } from "@/repo/interfaces/ProgressRepository";
import { UserProgress } from "@prisma/client";

export const createUserProgress = async (
    userProgressRepository: UserProgressRepository,
    data: CreateUserProgressData
): Promise<UserProgress> => {
    try {
        // Validate progress percentage
        if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
            throw new Error("Progress must be between 0 and 100");
        }

        if (data.duration !== undefined && data.duration <= 0) {
            throw new Error("Duration must be greater than 0");
        }

        if (data.caloriesBurned !== undefined && data.caloriesBurned < 0) {
            throw new Error("Calories burned cannot be negative");
        }

        const userProgress = await userProgressRepository.createUserProgress(data);
        return userProgress;
    } catch (error: any) {
        console.error("Error creating user progress:", error);
        throw error;
    }
};

export const getUserProgress = async (
    userProgressRepository: UserProgressRepository,
    filters: ProgressFilters
): Promise<UserProgress[]> => {
    try {
        const progress = await userProgressRepository.getUserProgress(filters);
        return progress;
    } catch (error: any) {
        console.error("Error fetching user progress:", error);
        throw error;
    }
};

export const updateUserProgress = async (
    userProgressRepository: UserProgressRepository,
    id: string,
    data: UpdateUserProgressData
): Promise<UserProgress> => {
    try {
        if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
            throw new Error("Progress must be between 0 and 100");
        }

        if (data.duration !== undefined && data.duration <= 0) {
            throw new Error("Duration must be greater than 0");
        }

        if (data.caloriesBurned !== undefined && data.caloriesBurned < 0) {
            throw new Error("Calories burned cannot be negative");
        }

        const userProgress = await userProgressRepository.updateUserProgress(id, data);
        return userProgress;
    } catch (error: any) {
        console.error("Error updating user progress:", error);
        throw error;
    }
};

export const deleteUserProgress = async (
    userProgressRepository: UserProgressRepository,
    id: string
): Promise<UserProgress> => {
    try {
        const userProgress = await userProgressRepository.deleteUserProgress(id);
        return userProgress;
    } catch (error: any) {
        console.error("Error deleting user progress:", error);
        throw error;
    }
};

export const getProgressStats = async (
    userProgressRepository: UserProgressRepository,
    userId: string
): Promise<any> => {
    try {
        const stats = await userProgressRepository.getProgressStats(userId);
        return stats;
    } catch (error: any) {
        console.error("Error fetching progress stats:", error);
        throw error;
    }
};

export const getCompletedWorkouts = async (
    userProgressRepository: UserProgressRepository,
    userId: string
): Promise<UserProgress[]> => {
    try {
        const workouts = await userProgressRepository.getCompletedWorkouts(userId);
        return workouts;
    } catch (error: any) {
        console.error("Error fetching completed workouts:", error);
        throw error;
    }
};