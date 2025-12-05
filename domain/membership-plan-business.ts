// domain/membership-plan-business.ts
import MembershipPlanRepository, { CreateMembershipPlanData, UpdateMembershipPlanData } from "@/repo/interfaces/MembershipPlanRepository";
import { MembershipPlan, MembershipTier } from "@prisma/client";

export const createMembershipPlan = async (
    membershipPlanRepository: MembershipPlanRepository,
    data: CreateMembershipPlanData
): Promise<MembershipPlan> => {
    try {
        // Validate price
        if (data.monthlyPrice <= 0) {
            throw new Error("Monthly price must be greater than 0");
        }

        // Check if tier already exists
        const existingPlan = await membershipPlanRepository.getMembershipPlanByTier(data.tier);
        if (existingPlan) {
            throw new Error(`A plan with tier ${data.tier} already exists`);
        }

        const plan = await membershipPlanRepository.createMembershipPlan(data);
        return plan;
    } catch (error: any) {
        console.error("Error creating membership plan:", error);
        throw error;
    }
};

export const getAllMembershipPlans = async (
    membershipPlanRepository: MembershipPlanRepository
): Promise<MembershipPlan[]> => {
    try {
        const plans = await membershipPlanRepository.getAllMembershipPlans();
        return plans;
    } catch (error: any) {
        console.error("Error fetching all membership plans:", error);
        throw error;
    }
};

export const getActiveMembershipPlans = async (
    membershipPlanRepository: MembershipPlanRepository
): Promise<MembershipPlan[]> => {
    try {
        const plans = await membershipPlanRepository.getActiveMembershipPlans();
        return plans;
    } catch (error: any) {
        console.error("Error fetching active membership plans:", error);
        throw error;
    }
};

export const getMembershipPlan = async (
    membershipPlanRepository: MembershipPlanRepository,
    id: string
): Promise<MembershipPlan | null> => {
    try {
        const plan = await membershipPlanRepository.getMembershipPlanById(id);
        return plan;
    } catch (error: any) {
        console.error("Error fetching membership plan:", error);
        throw error;
    }
};

export const updateMembershipPlan = async (
    membershipPlanRepository: MembershipPlanRepository,
    id: string,
    data: UpdateMembershipPlanData
): Promise<MembershipPlan> => {
    try {
        if (data.monthlyPrice !== undefined && data.monthlyPrice <= 0) {
            throw new Error("Monthly price must be greater than 0");
        }

        const plan = await membershipPlanRepository.updateMembershipPlan(id, data);
        return plan;
    } catch (error: any) {
        console.error("Error updating membership plan:", error);
        throw error;
    }
};

export const deleteMembershipPlan = async (
    membershipPlanRepository: MembershipPlanRepository,
    id: string
): Promise<MembershipPlan> => {
    try {
        const plan = await membershipPlanRepository.deleteMembershipPlan(id);
        return plan;
    } catch (error: any) {
        console.error("Error deleting membership plan:", error);
        throw error;
    }
};