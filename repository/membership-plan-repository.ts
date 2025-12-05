// repository/membership-plan-repository.ts
import { PrismaClient, MembershipPlan, MembershipTier } from "@prisma/client";
import MembershipPlanRepository, { CreateMembershipPlanData, UpdateMembershipPlanData } from "./interfaces/MembershipPlanRepository";

const prisma = new PrismaClient();

export const createMembershipPlan = async (data: CreateMembershipPlanData): Promise<MembershipPlan> => {
    try {
        return await prisma.membershipPlan.create({
            data: {
                name: data.name,
                tier: data.tier,
                description: data.description,
                monthlyPrice: data.monthlyPrice,
                quarterlyPrice: data.quarterlyPrice,
                yearlyPrice: data.yearlyPrice,
                currency: data.currency || 'LSL',
                features: data.features,
                maxWorkouts: data.maxWorkouts,
                maxVideos: data.maxVideos,
                hasPersonalTraining: data.hasPersonalTraining || false,
                hasNutritionPlan: data.hasNutritionPlan || false,
                isActive: data.isActive !== undefined ? data.isActive : true,
            }
        });
    } catch (error: any) {
        console.error("Error creating membership plan:", error);
        throw new Error("Failed to create membership plan");
    }
};

export const getMembershipPlanById = async (id: string): Promise<MembershipPlan | null> => {
    try {
        return await prisma.membershipPlan.findUnique({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error fetching membership plan:", error);
        throw new Error("Failed to get membership plan");
    }
};

export const getMembershipPlanByTier = async (tier: MembershipTier): Promise<MembershipPlan | null> => {
    try {
        return await prisma.membershipPlan.findUnique({
            where: { tier }
        });
    } catch (error: any) {
        console.error("Error fetching membership plan by tier:", error);
        throw new Error("Failed to get membership plan by tier");
    }
};

export const getAllMembershipPlans = async (): Promise<MembershipPlan[]> => {
    try {
        return await prisma.membershipPlan.findMany({
            orderBy: { monthlyPrice: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching all membership plans:", error);
        throw new Error("Failed to get all membership plans");
    }
};

export const getActiveMembershipPlans = async (): Promise<MembershipPlan[]> => {
    try {
        return await prisma.membershipPlan.findMany({
            where: { isActive: true },
            orderBy: { monthlyPrice: 'asc' }
        });
    } catch (error: any) {
        console.error("Error fetching active membership plans:", error);
        throw new Error("Failed to get active membership plans");
    }
};

export const updateMembershipPlan = async (id: string, data: UpdateMembershipPlanData): Promise<MembershipPlan> => {
    try {
        return await prisma.membershipPlan.update({
            where: { id },
            data
        });
    } catch (error: any) {
        console.error("Error updating membership plan:", error);
        throw new Error("Failed to update membership plan");
    }
};

export const deleteMembershipPlan = async (id: string): Promise<MembershipPlan> => {
    try {
        return await prisma.membershipPlan.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting membership plan:", error);
        throw new Error("Failed to delete membership plan");
    }
};

const membershipPlanRepository: MembershipPlanRepository = {
    createMembershipPlan,
    getMembershipPlanById,
    getMembershipPlanByTier,
    getAllMembershipPlans,
    getActiveMembershipPlans,
    updateMembershipPlan,
    deleteMembershipPlan,
};

export default membershipPlanRepository;