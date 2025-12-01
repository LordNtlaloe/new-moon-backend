import MembershipRepository, { CreateMembershipData, UpdateMembershipData } from "@/repo/interfaces/MembershipRepository";
import { Membership, MembershipStatus, MembershipTier } from "@prisma/client";

export const createNewMembership = async (
    membershipRepository: MembershipRepository,
    data: CreateMembershipData
): Promise<Membership> => {
    try {
        // Validate dates
        if (data.startDate >= data.endDate) {
            throw new Error("End date must be after start date");
        }

        // Validate amount
        if (data.amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const membership = await membershipRepository.createMembership(data);
        return membership;
    } catch (error: any) {
        console.error("Error creating membership:", error);
        throw error;
    }
};

export const getUserMemberships = async (
    membershipRepository: MembershipRepository,
    userId: string
): Promise<Membership[]> => {
    try {
        const memberships = await membershipRepository.getMembershipsByUserId(userId);
        return memberships;
    } catch (error: any) {
        console.error("Error fetching user memberships:", error);
        throw error;
    }
};

export const getMembership = async (
    membershipRepository: MembershipRepository,
    id: string
): Promise<Membership | null> => {
    try {
        const membership = await membershipRepository.getMembershipById(id);
        return membership;
    } catch (error: any) {
        console.error("Error fetching membership:", error);
        throw error;
    }
};

export const updateMembershipStatus = async (
    membershipRepository: MembershipRepository,
    id: string,
    status: MembershipStatus
): Promise<Membership> => {
    try {
        const membership = await membershipRepository.updateMembership(id, { status });
        return membership;
    } catch (error: any) {
        console.error("Error updating membership status:", error);
        throw error;
    }
};

export const cancelMembership = async (
    membershipRepository: MembershipRepository,
    id: string
): Promise<Membership> => {
    try {
        const membership = await membershipRepository.updateMembership(id, {
            status: 'CANCELLED',
            autoRenew: false
        });
        return membership;
    } catch (error: any) {
        console.error("Error cancelling membership:", error);
        throw error;
    }
};

export const getActiveUserMembership = async (
    membershipRepository: MembershipRepository,
    userId: string
): Promise<Membership | null> => {
    try {
        const membership = await membershipRepository.getActiveMembershipByUserId(userId);
        return membership;
    } catch (error: any) {
        console.error("Error fetching active membership:", error);
        throw error;
    }
};

export default {
    createNewMembership,
    getUserMemberships,
    getMembership,
    updateMembershipStatus,
    cancelMembership,
    getActiveUserMembership,

};