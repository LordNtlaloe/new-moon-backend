// domain/workout-business.ts
import WorkoutRepository, { CreateWorkoutData, UpdateWorkoutData, WorkoutFilters } from "@/repo/interfaces/WorkoutRepository";
import { Workout } from "@prisma/client";

export const createWorkout = async (
    workoutRepository: WorkoutRepository,
    data: CreateWorkoutData,
    exercises?: Array<{ exerciseId: string; order: number; sets?: number; reps?: number; duration?: number }>
): Promise<Workout> => {
    try {
        // Validate duration and calories
        if (data.duration <= 0) {
            throw new Error("Duration must be greater than 0");
        }
        if (data.totalCalories < 0) {
            throw new Error("Total calories cannot be negative");
        }

        const workout = await workoutRepository.createWorkout(data);

        // Add exercises if provided
        if (exercises && exercises.length > 0) {
            for (const exercise of exercises) {
                await workoutRepository.addExerciseToWorkout(
                    workout.id,
                    exercise.exerciseId,
                    exercise.order,
                    exercise.sets,
                    exercise.reps,
                    exercise.duration
                );
            }
        }

        // Ensure the final returned value is not null
        const fullWorkout = await workoutRepository.getWorkoutById(workout.id);
        if (!fullWorkout) {
            throw new Error("Workout creation failed: created workout could not be retrieved.");
        }

        return fullWorkout;
    } catch (error: any) {
        console.error("Error creating workout:", error);
        throw error;
    }
};

export const getWorkout = async (
    workoutRepository: WorkoutRepository,
    id: string
): Promise<Workout | null> => {
    try {
        const workout = await workoutRepository.getWorkoutById(id);
        return workout;
    } catch (error: any) {
        console.error("Error fetching workout:", error);
        throw error;
    }
};

export const getWorkoutsByFilters = async (
    workoutRepository: WorkoutRepository,
    filters: WorkoutFilters
): Promise<Workout[]> => {
    try {
        const workouts = await workoutRepository.getWorkoutsByFilters(filters);
        return workouts;
    } catch (error: any) {
        console.error("Error fetching workouts by filters:", error);
        throw error;
    }
}

export const updateWorkout = async (
    workoutRepository: WorkoutRepository,
    id: string,
    data: UpdateWorkoutData
): Promise<Workout> => {
    try {
        if (data.duration !== undefined && data.duration <= 0) {
            throw new Error("Duration must be greater than 0");
        }
        if (data.totalCalories !== undefined && data.totalCalories < 0) {
            throw new Error("Total calories cannot be negative");
        }

        const workout = await workoutRepository.updateWorkout(id, data);
        return workout;
    } catch (error: any) {
        console.error("Error updating workout:", error);
        throw error;
    }
};

export const deleteWorkout = async (
    workoutRepository: WorkoutRepository,
    id: string
): Promise<Workout> => {
    try {
        const workout = await workoutRepository.deleteWorkout(id);
        return workout;
    } catch (error: any) {
        console.error("Error deleting workout:", error);
        throw error;
    }
};

export const getWorkoutsByTier = async (
    workoutRepository: WorkoutRepository,
    tier: string
): Promise<Workout[]> => {
    try {
        const workouts = await workoutRepository.getWorkoutsByTier(tier as any);
        return workouts;
    } catch (error: any) {
        console.error("Error fetching workouts by tier:", error);
        throw error;
    }
};

export const addExerciseToWorkout = async (
    workoutRepository: WorkoutRepository,
    workoutId: string,
    exerciseId: string,
    order: number,
    sets?: number,
    reps?: number,
    duration?: number
): Promise<any> => {
    try {
        if (order < 0) {
            throw new Error("Order must be a positive number");
        }

        const workoutExercise = await workoutRepository.addExerciseToWorkout(
            workoutId,
            exerciseId,
            order,
            sets,
            reps,
            duration
        );

        return workoutExercise;
    } catch (error: any) {
        console.error("Error adding exercise to workout:", error);
        throw error;
    }
};
