import {
    Exercise,
    Workout,
    UserProgress,
    ExerciseDifficulty,
    WorkoutType,
    MembershipTier
} from "@prisma/client";

interface CreateExerciseData {
    name: string;
    description?: string;
    difficulty: ExerciseDifficulty;
    duration: number;
    calories: number;
    image?: string;
    videoUrl?: string;
    instructions?: any[];
    requiredTier?: MembershipTier;
}

interface CreateWorkoutData {
    title: string;
    description?: string;
    type: WorkoutType;
    duration: number;
    totalCalories: number;
    image?: string;
    requiredTier?: MembershipTier;
    isPremium?: boolean;
    exerciseIds: string[];
}

interface UpdateProgressData {
    completed?: boolean;
    progress?: number;
    duration?: number;
    caloriesBurned?: number;
    completedAt?: Date;
}

export default interface WorkoutRepository {
    // Exercises
    getExercisesByDifficulty(difficulty: ExerciseDifficulty, tier: MembershipTier): Promise<Exercise[]>;
    getExerciseById(id: string): Promise<Exercise | null>;

    // Workouts
    getWorkoutsByTier(tier: MembershipTier): Promise<Workout[]>;
    getWorkoutById(id: string): Promise<Workout | null>;
    getWorkoutsByType(type: WorkoutType, tier: MembershipTier): Promise<Workout[]>;
    getTrendingWorkouts(tier: MembershipTier, limit?: number): Promise<Workout[]>;
    getWorkoutWithExercises(id: string): Promise<(Workout & { workoutExercises: { exercise: Exercise }[] }) | null>;

    // User Progress
    getUserProgress(userId: string, workoutId: string, exerciseId?: string): Promise<UserProgress | null>;
    updateUserProgress(userId: string, workoutId: string, data: UpdateProgressData, exerciseId?: string): Promise<UserProgress>;
    getUserWorkoutProgress(userId: string, workoutId: string): Promise<UserProgress[]>;
    getTodayWorkouts(userId: string): Promise<Workout[]>;
}

export type { WorkoutRepository, UpdateProgressData, CreateExerciseData, CreateWorkoutData }