// repository/exercise-repository.ts
import { PrismaClient, Exercise, ExerciseDifficulty, MembershipTier } from "@prisma/client";
import ExerciseRepository, { CreateExerciseData, UpdateExerciseData, ExerciseFilters } from "./interfaces/ExerciseRepository";

const prisma = new PrismaClient();

export const createExercise = async (data: CreateExerciseData): Promise<Exercise> => {
    try {
        return await prisma.exercise.create({
            data: {
                name: data.name,
                description: data.description,
                difficulty: data.difficulty,
                duration: data.duration,
                calories: data.calories,
                image: data.image,
                videoUrl: data.videoUrl,
                instructions: data.instructions,
                requiredTier: data.requiredTier || 'FREE',
            }
        });
    } catch (error: any) {
        console.error("Error creating exercise:", error);
        throw new Error("Failed to create exercise");
    }
};

export const getExerciseById = async (id: string): Promise<Exercise | null> => {
    try {
        return await prisma.exercise.findUnique({
            where: { id },
            include: {
                workoutExercises: {
                    include: {
                        workout: true
                    }
                }
            }
        });
    } catch (error: any) {
        console.error("Error fetching exercise:", error);
        throw new Error("Failed to get exercise");
    }
};

export const getAllExercises = async (): Promise<Exercise[]> => {
    try {
        return await prisma.exercise.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching all exercises:", error);
        throw new Error("Failed to get all exercises");
    }
};

export const getExercisesByFilters = async (filters: ExerciseFilters): Promise<Exercise[]> => {
    try {
        const where: any = {};

        if (filters.difficulty) {
            where.difficulty = filters.difficulty;
        }

        if (filters.requiredTier) {
            where.requiredTier = filters.requiredTier;
        }

        if (filters.durationMin || filters.durationMax) {
            where.duration = {};
            if (filters.durationMin) where.duration.gte = filters.durationMin;
            if (filters.durationMax) where.duration.lte = filters.durationMax;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        return await prisma.exercise.findMany({
            where,
            orderBy: { name: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching exercises by filters:", error);
        throw new Error("Failed to get exercises by filters");
    }
};

export const updateExercise = async (id: string, data: UpdateExerciseData): Promise<Exercise> => {
    try {
        return await prisma.exercise.update({
            where: { id },
            data
        });
    } catch (error: any) {
        console.error("Error updating exercise:", error);
        throw new Error("Failed to update exercise");
    }
};

export const deleteExercise = async (id: string): Promise<Exercise> => {
    try {
        return await prisma.exercise.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting exercise:", error);
        throw new Error("Failed to delete exercise");
    }
};

export const getExercisesByTier = async (tier: MembershipTier): Promise<Exercise[]> => {
    try {
        return await prisma.exercise.findMany({
            where: { requiredTier: tier },
            orderBy: { name: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching exercises by tier:", error);
        throw new Error("Failed to get exercises by tier");
    }
};

const exerciseRepository: ExerciseRepository = {
    createExercise,
    getExerciseById,
    getAllExercises,
    getExercisesByFilters,
    updateExercise,
    deleteExercise,
    getExercisesByTier,
};

export default exerciseRepository;