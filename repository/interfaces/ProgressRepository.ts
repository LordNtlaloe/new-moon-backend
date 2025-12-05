// repository/interfaces/UserProgressRepository.ts
import { UserProgress } from "@prisma/client";

export interface CreateUserProgressData {
    userId: string;
    workoutId: string;
    exerciseId?: string;
    completed?: boolean;
    progress?: number;
    duration?: number;
    caloriesBurned?: number;
    startedAt?: Date;
    completedAt?: Date;
}

export interface UpdateUserProgressData {
    completed?: boolean;
    progress?: number;
    duration?: number;
    caloriesBurned?: number;
    startedAt?: Date;
    completedAt?: Date;
}

export interface ProgressFilters {
    userId: string;
    workoutId?: string;
    exerciseId?: string;
    completed?: boolean;
    dateFrom?: Date;
    dateTo?: Date;
}

export default interface UserProgressRepository {
    createUserProgress(data: CreateUserProgressData): Promise<UserProgress>;
    getUserProgressById(id: string): Promise<UserProgress | null>;
    getUserProgress(filters: ProgressFilters): Promise<UserProgress[]>;
    updateUserProgress(id: string, data: UpdateUserProgressData): Promise<UserProgress>;
    deleteUserProgress(id: string): Promise<UserProgress>;
    getUserWorkoutProgress(userId: string, workoutId: string): Promise<UserProgress[]>;
    getCompletedWorkouts(userId: string): Promise<UserProgress[]>;
    getProgressStats(userId: string): Promise<any>;
}