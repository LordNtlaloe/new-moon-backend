import { PrismaClient, Membership } from "@prisma/client";
import MembershipRepository, { CreateMembershipData, UpdateMembershipData } from "./interfaces/MembershipRepository";

const prisma = new PrismaClient();

export const createMembership = async (data: CreateMembershipData): Promise<Membership> => {
    try {
        return await prisma.membership.create({
            data: {
                userId: data.userId,
                tier: data.tier,
                status: data.status || 'ACTIVE',
                startDate: data.startDate,
                endDate: data.endDate,
                autoRenew: data.autoRenew ?? true,
                amount: data.amount,
                currency: data.currency || 'LSL',
            },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error creating membership:", error);
        throw new Error("Failed to create membership");
    }
};

export const getMembershipById = async (id: string): Promise<Membership | null> => {
    try {
        return await prisma.membership.findUnique({
            where: { id },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error fetching membership:", error);
        throw new Error("Failed to get membership");
    }
};

export const getMembershipsByUserId = async (userId: string): Promise<Membership[]> => {
    try {
        return await prisma.membership.findMany({
            where: { userId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching user memberships:", error);
        throw new Error("Failed to get user memberships");
    }
};

export const updateMembership = async (id: string, data: UpdateMembershipData): Promise<Membership> => {
    try {
        return await prisma.membership.update({
            where: { id },
            data,
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error updating membership:", error);
        throw new Error("Failed to update membership");
    }
};

export const deleteMembership = async (id: string): Promise<Membership> => {
    try {
        return await prisma.membership.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting membership:", error);
        throw new Error("Failed to delete membership");
    }
};

export const getActiveMembershipByUserId = async (userId: string): Promise<Membership | null> => {
    try {
        return await prisma.membership.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                endDate: { gte: new Date() }
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching active membership:", error);
        throw new Error("Failed to get active membership");
    }
};

const membershipRepository: MembershipRepository = {
    createMembership,
    getMembershipById,
    getMembershipsByUserId,
    updateMembership,
    deleteMembership,
    getActiveMembershipByUserId,
};

export default membershipRepository;