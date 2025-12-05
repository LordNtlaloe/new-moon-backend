// repository/workout-repository.ts
import { PrismaClient, Workout, WorkoutType, MembershipTier } from "@prisma/client";
import WorkoutRepository, { CreateWorkoutData, UpdateWorkoutData, WorkoutFilters } from "./interfaces/WorkoutRepository";

const prisma = new PrismaClient();

export const createWorkout = async (data: CreateWorkoutData): Promise<Workout> => {
    try {
        return await prisma.workout.create({
            data: {
                title: data.title,
                description: data.description,
                type: data.type,
                duration: data.duration,
                totalCalories: data.totalCalories,
                image: data.image,
                requiredTier: data.requiredTier || MembershipTier.FREE,
                isPremium: data.isPremium || false,
            }
        });
    } catch (error: any) {
        console.error("Error creating workout:", error);
        throw new Error("Failed to create workout");
    }
};

export const getWorkoutById = async (id: string): Promise<Workout | null> => {
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
        console.error("Error fetching workout:", error);
        throw new Error("Failed to get workout");
    }
};

export const getAllWorkouts = async (): Promise<Workout[]> => {
    try {
        return await prisma.workout.findMany({
            orderBy: { title: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching all workouts:", error);
        throw new Error("Failed to get all workouts");
    }
};

export const getWorkoutsByFilters = async (filters: WorkoutFilters): Promise<Workout[]> => {
    try {
        const where: any = {};

        if (filters.type) {
            where.type = filters.type;
        }

        if (filters.requiredTier) {
            if (typeof filters.requiredTier === 'object' && 'in' in filters.requiredTier) {
                where.requiredTier = { in: filters.requiredTier.in };
            } else {
                where.requiredTier = filters.requiredTier;
            }
        }

        if (filters.isPremium !== undefined) {
            where.isPremium = filters.isPremium;
        }

        if (filters.durationMin || filters.durationMax) {
            where.duration = {};
            if (filters.durationMin) where.duration.gte = filters.durationMin;
            if (filters.durationMax) where.duration.lte = filters.durationMax;
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        return await prisma.workout.findMany({
            where,
            orderBy: { title: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching workouts by filters:", error);
        throw new Error("Failed to get workouts by filters");
    }
};

export const updateWorkout = async (id: string, data: UpdateWorkoutData): Promise<Workout> => {
    try {
        return await prisma.workout.update({
            where: { id },
            data
        });
    } catch (error: any) {
        console.error("Error updating workout:", error);
        throw new Error("Failed to update workout");
    }
};

export const deleteWorkout = async (id: string): Promise<Workout> => {
    try {
        return await prisma.workout.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting workout:", error);
        throw new Error("Failed to delete workout");
    }
};

// UPDATED: Accepts all MembershipTier values
export const getWorkoutsByTier = async (tier: MembershipTier): Promise<Workout[]> => {
    try {
        return await prisma.workout.findMany({
            where: { requiredTier: tier },
            orderBy: { title: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching workouts by tier:", error);
        throw new Error("Failed to get workouts by tier");
    }
};

export const addExerciseToWorkout = async (
    workoutId: string,
    exerciseId: string,
    order: number,
    sets?: number,
    reps?: number,
    duration?: number
): Promise<any> => {
    try {
        return await prisma.workoutExercise.create({
            data: {
                workoutId,
                exerciseId,
                order,
                sets,
                reps,
                duration
            },
            include: {
                workout: true,
                exercise: true
            }
        });
    } catch (error: any) {
        console.error("Error adding exercise to workout:", error);
        throw new Error("Failed to add exercise to workout");
    }
};

export const removeExerciseFromWorkout = async (workoutId: string, exerciseId: string): Promise<any> => {
    try {
        return await prisma.workoutExercise.delete({
            where: {
                workoutId_exerciseId: {
                    workoutId,
                    exerciseId
                }
            }
        });
    } catch (error: any) {
        console.error("Error removing exercise from workout:", error);
        throw new Error("Failed to remove exercise from workout");
    }
};

export const getWorkoutExercises = async (workoutId: string): Promise<any[]> => {
    try {
        return await prisma.workoutExercise.findMany({
            where: { workoutId },
            include: {
                exercise: true
            },
            orderBy: { order: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching workout exercises:", error);
        throw new Error("Failed to get workout exercises");
    }
};

const workoutRepository: WorkoutRepository = {
    createWorkout,
    getWorkoutById,
    getAllWorkouts,
    getWorkoutsByFilters,
    updateWorkout,
    deleteWorkout,
    getWorkoutsByTier,
    addExerciseToWorkout,
    removeExerciseFromWorkout,
    getWorkoutExercises,
};

export default workoutRepository;