// repository/interfaces/ContentAccessRepository.ts
import { ContentAccess, MembershipTier } from "@prisma/client";

export interface CreateContentAccessData {
    contentType: string;
    contentId: string;
    title: string;
    requiredTier: MembershipTier;
    isPremium?: boolean;
}

export interface UpdateContentAccessData {
    title?: string;
    requiredTier?: MembershipTier;
    isPremium?: boolean;
}

export default interface ContentAccessRepository {
    createContentAccess(data: CreateContentAccessData): Promise<ContentAccess>;
    getContentAccessById(id: string): Promise<ContentAccess | null>;
    getContentAccessByContent(contentType: string, contentId: string): Promise<ContentAccess | null>;
    getAllContentAccess(): Promise<ContentAccess[]>;
    getContentAccessByTier(tier: MembershipTier): Promise<ContentAccess[]>;
    updateContentAccess(id: string, data: UpdateContentAccessData): Promise<ContentAccess>;
    deleteContentAccess(id: string): Promise<ContentAccess>;
    addUserToContentAccess(contentAccessId: string, userId: string): Promise<ContentAccess>;
    removeUserFromContentAccess(contentAccessId: string, userId: string): Promise<ContentAccess>;
    getUserContentAccess(userId: string): Promise<ContentAccess[]>;
}