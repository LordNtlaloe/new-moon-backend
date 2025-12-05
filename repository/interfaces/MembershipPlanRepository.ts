// repository/interfaces/MembershipPlanRepository.ts
import { MembershipPlan, MembershipTier } from "@prisma/client";

export interface CreateMembershipPlanData {
    name: string;
    tier: MembershipTier;
    description?: string;
    monthlyPrice: number;
    quarterlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
    features: any;
    maxWorkouts?: number;
    maxVideos?: number;
    hasPersonalTraining?: boolean;
    hasNutritionPlan?: boolean;
    isActive?: boolean;
}

export interface UpdateMembershipPlanData {
    name?: string;
    description?: string;
    monthlyPrice?: number;
    quarterlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
    features?: any;
    maxWorkouts?: number;
    maxVideos?: number;
    hasPersonalTraining?: boolean;
    hasNutritionPlan?: boolean;
    isActive?: boolean;
}

export default interface MembershipPlanRepository {
    createMembershipPlan(data: CreateMembershipPlanData): Promise<MembershipPlan>;
    getMembershipPlanById(id: string): Promise<MembershipPlan | null>;
    getMembershipPlanByTier(tier: MembershipTier): Promise<MembershipPlan | null>;
    getAllMembershipPlans(): Promise<MembershipPlan[]>;
    getActiveMembershipPlans(): Promise<MembershipPlan[]>;
    updateMembershipPlan(id: string, data: UpdateMembershipPlanData): Promise<MembershipPlan>;
    deleteMembershipPlan(id: string): Promise<MembershipPlan>;
}