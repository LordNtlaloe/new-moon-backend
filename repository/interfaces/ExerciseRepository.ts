// repository/interfaces/ExerciseRepository.ts
import { Exercise, ExerciseDifficulty, MembershipTier } from "@prisma/client";

export interface CreateExerciseData {
    name: string;
    description?: string;
    difficulty: ExerciseDifficulty;
    duration: number;
    calories: number;
    image?: string;
    videoUrl?: string;
    instructions?: any;
    requiredTier?: MembershipTier;
}

export interface UpdateExerciseData {
    name?: string;
    description?: string;
    difficulty?: ExerciseDifficulty;
    duration?: number;
    calories?: number;
    image?: string;
    videoUrl?: string;
    instructions?: any;
    requiredTier?: MembershipTier;
}

export interface ExerciseFilters {
    difficulty?: ExerciseDifficulty;
    requiredTier?: MembershipTier;
    durationMin?: number;
    durationMax?: number;
    search?: string;
}

export default interface ExerciseRepository {
    createExercise(data: CreateExerciseData): Promise<Exercise>;
    getExerciseById(id: string): Promise<Exercise | null>;
    getAllExercises(): Promise<Exercise[]>;
    getExercisesByFilters(filters: ExerciseFilters): Promise<Exercise[]>;
    updateExercise(id: string, data: UpdateExerciseData): Promise<Exercise>;
    deleteExercise(id: string): Promise<Exercise>;
    getExercisesByTier(tier: MembershipTier): Promise<Exercise[]>;
}