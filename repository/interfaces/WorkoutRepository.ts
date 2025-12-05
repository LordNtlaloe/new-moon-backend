// repository/interfaces/WorkoutRepository.ts
import { Workout, WorkoutType, MembershipTier } from "@prisma/client";

export interface CreateWorkoutData {
    title: string;
    description?: string;
    type: WorkoutType;
    duration: number;
    totalCalories: number;
    image?: string;
    requiredTier?: MembershipTier;
    isPremium?: boolean;
}

export interface UpdateWorkoutData {
    title?: string;
    description?: string;
    type?: WorkoutType;
    duration?: number;
    totalCalories?: number;
    image?: string;
    requiredTier?: MembershipTier;
    isPremium?: boolean;
}

export interface WorkoutFilters {
    type?: WorkoutType;
    requiredTier?: MembershipTier | { in: MembershipTier[] };
    isPremium?: boolean;
    durationMin?: number;
    durationMax?: number;
    search?: string;
}

export default interface WorkoutRepository {
    createWorkout(data: CreateWorkoutData): Promise<Workout>;
    getWorkoutById(id: string): Promise<Workout | null>;
    getAllWorkouts(): Promise<Workout[]>;
    getWorkoutsByFilters(filters: WorkoutFilters): Promise<Workout[]>;
    updateWorkout(id: string, data: UpdateWorkoutData): Promise<Workout>;
    deleteWorkout(id: string): Promise<Workout>;
    getWorkoutsByTier(tier: MembershipTier): Promise<Workout[]>; // UPDATED: Accepts all MembershipTier
    addExerciseToWorkout(workoutId: string, exerciseId: string, order: number, sets?: number, reps?: number, duration?: number): Promise<any>;
    removeExerciseFromWorkout(workoutId: string, exerciseId: string): Promise<any>;
    getWorkoutExercises(workoutId: string): Promise<any[]>;
}