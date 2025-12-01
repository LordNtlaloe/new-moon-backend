import { Membership, MembershipStatus, MembershipTier } from "@prisma/client";

export interface CreateMembershipData {
    userId: string;
    tier: MembershipTier;
    status?: MembershipStatus;
    startDate: Date;
    endDate: Date;
    autoRenew?: boolean;
    amount: number;
    currency?: string;
}

export interface UpdateMembershipData {
    tier?: MembershipTier;
    status?: MembershipStatus;
    startDate?: Date;
    endDate?: Date;
    autoRenew?: boolean;
    amount?: number;
    currency?: string;
}

export default interface MembershipRepository {
    createMembership(data: CreateMembershipData): Promise<Membership>;
    getMembershipById(id: string): Promise<Membership | null>;
    getMembershipsByUserId(userId: string): Promise<Membership[]>;
    updateMembership(id: string, data: UpdateMembershipData): Promise<Membership>;
    deleteMembership(id: string): Promise<Membership>;
    getActiveMembershipByUserId(userId: string): Promise<Membership | null>;
}