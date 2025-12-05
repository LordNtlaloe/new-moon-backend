// domain/exercise-business.ts
import ExerciseRepository, { CreateExerciseData, UpdateExerciseData, ExerciseFilters } from "@/repo/interfaces/ExerciseRepository";
import { Exercise } from "@prisma/client";

export const createExercise = async (
    exerciseRepository: ExerciseRepository,
    data: CreateExerciseData
): Promise<Exercise> => {
    try {
        // Validate duration and calories
        if (data.duration <= 0) {
            throw new Error("Duration must be greater than 0");
        }
        if (data.calories < 0) {
            throw new Error("Calories cannot be negative");
        }

        const exercise = await exerciseRepository.createExercise(data);
        return exercise;
    } catch (error: any) {
        console.error("Error creating exercise:", error);
        throw error;
    }
};

export const getExercise = async (
    exerciseRepository: ExerciseRepository,
    id: string
): Promise<Exercise | null> => {
    try {
        const exercise = await exerciseRepository.getExerciseById(id);
        return exercise;
    } catch (error: any) {
        console.error("Error fetching exercise:", error);
        throw error;
    }
};

export const getExercisesByFilters = async (
    exerciseRepository: ExerciseRepository,
    filters: ExerciseFilters
): Promise<Exercise[]> => {
    try {
        const exercises = await exerciseRepository.getExercisesByFilters(filters);
        return exercises;
    } catch (error: any) {
        console.error("Error fetching exercises by filters:", error);
        throw error;
    }
};

export const updateExercise = async (
    exerciseRepository: ExerciseRepository,
    id: string,
    data: UpdateExerciseData
): Promise<Exercise> => {
    try {
        if (data.duration !== undefined && data.duration <= 0) {
            throw new Error("Duration must be greater than 0");
        }
        if (data.calories !== undefined && data.calories < 0) {
            throw new Error("Calories cannot be negative");
        }

        const exercise = await exerciseRepository.updateExercise(id, data);
        return exercise;
    } catch (error: any) {
        console.error("Error updating exercise:", error);
        throw error;
    }
};

export const deleteExercise = async (
    exerciseRepository: ExerciseRepository,
    id: string
): Promise<Exercise> => {
    try {
        const exercise = await exerciseRepository.deleteExercise(id);
        return exercise;
    } catch (error: any) {
        console.error("Error deleting exercise:", error);
        throw error;
    }
};

export const getExercisesByTier = async (
    exerciseRepository: ExerciseRepository,
    tier: string
): Promise<Exercise[]> => {
    try {
        const exercises = await exerciseRepository.getExercisesByTier(tier as any);
        return exercises;
    } catch (error: any) {
        console.error("Error fetching exercises by tier:", error);
        throw error;
    }
};