// repository/content-access-repository.ts
import { PrismaClient, ContentAccess, MembershipTier } from "@prisma/client";
import ContentAccessRepository, { CreateContentAccessData, UpdateContentAccessData } from "./interfaces/ContentAccessRepository";

const prisma = new PrismaClient();

export const createContentAccess = async (data: CreateContentAccessData): Promise<ContentAccess> => {
    try {
        return await prisma.contentAccess.create({
            data: {
                contentType: data.contentType,
                contentId: data.contentId,
                title: data.title,
                requiredTier: data.requiredTier,
                isPremium: data.isPremium || false,
            }
        });
    } catch (error: any) {
        console.error("Error creating content access:", error);
        throw new Error("Failed to create content access");
    }
};

export const getContentAccessById = async (id: string): Promise<ContentAccess | null> => {
    try {
        return await prisma.contentAccess.findUnique({
            where: { id },
            include: { users: true }
        });
    } catch (error: any) {
        console.error("Error fetching content access:", error);
        throw new Error("Failed to get content access");
    }
};

export const getContentAccessByContent = async (contentType: string, contentId: string): Promise<ContentAccess | null> => {
    try {
        return await prisma.contentAccess.findUnique({
            where: {
                contentType_contentId: {
                    contentType,
                    contentId
                }
            },
            include: { users: true }
        });
    } catch (error: any) {
        console.error("Error fetching content access by content:", error);
        throw new Error("Failed to get content access by content");
    }
};

export const getAllContentAccess = async (): Promise<ContentAccess[]> => {
    try {
        return await prisma.contentAccess.findMany({
            include: { users: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching all content access:", error);
        throw new Error("Failed to get all content access");
    }
};

export const getContentAccessByTier = async (tier: MembershipTier): Promise<ContentAccess[]> => {
    try {
        return await prisma.contentAccess.findMany({
            where: { requiredTier: tier },
            include: { users: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching content access by tier:", error);
        throw new Error("Failed to get content access by tier");
    }
};

export const updateContentAccess = async (id: string, data: UpdateContentAccessData): Promise<ContentAccess> => {
    try {
        return await prisma.contentAccess.update({
            where: { id },
            data,
            include: { users: true }
        });
    } catch (error: any) {
        console.error("Error updating content access:", error);
        throw new Error("Failed to update content access");
    }
};

export const deleteContentAccess = async (id: string): Promise<ContentAccess> => {
    try {
        return await prisma.contentAccess.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting content access:", error);
        throw new Error("Failed to delete content access");
    }
};

export const addUserToContentAccess = async (contentAccessId: string, userId: string): Promise<ContentAccess> => {
    try {
        return await prisma.contentAccess.update({
            where: { id: contentAccessId },
            data: {
                users: {
                    connect: { id: userId }
                }
            },
            include: { users: true }
        });
    } catch (error: any) {
        console.error("Error adding user to content access:", error);
        throw new Error("Failed to add user to content access");
    }
};

export const removeUserFromContentAccess = async (contentAccessId: string, userId: string): Promise<ContentAccess> => {
    try {
        return await prisma.contentAccess.update({
            where: { id: contentAccessId },
            data: {
                users: {
                    disconnect: { id: userId }
                }
            },
            include: { users: true }
        });
    } catch (error: any) {
        console.error("Error removing user from content access:", error);
        throw new Error("Failed to remove user from content access");
    }
};

export const getUserContentAccess = async (userId: string): Promise<ContentAccess[]> => {
    try {
        return await prisma.contentAccess.findMany({
            where: {
                users: {
                    some: {
                        id: userId
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching user content access:", error);
        throw new Error("Failed to get user content access");
    }
};

const contentAccessRepository: ContentAccessRepository = {
    createContentAccess,
    getContentAccessById,
    getContentAccessByContent,
    getAllContentAccess,
    getContentAccessByTier,
    updateContentAccess,
    deleteContentAccess,
    addUserToContentAccess,
    removeUserFromContentAccess,
    getUserContentAccess,
};

export default contentAccessRepository;