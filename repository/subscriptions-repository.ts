import { PrismaClient, Subscription } from "@prisma/client";
import  SubscriptionRepository , { CreateSubscriptionData, UpdateSubscriptionData} from "./interfaces/SubscriptionsRepository";

const prisma = new PrismaClient();

export const createSubscription = async (data: CreateSubscriptionData): Promise<Subscription> => {
    try {
        return await prisma.subscription.create({
            data: {
                userId: data.userId,
                tier: data.tier,
                status: data.status || 'ACTIVE',
                billingCycle: data.billingCycle,
                amount: data.amount,
                currency: data.currency || 'LSL',
                currentPeriodStart: data.currentPeriodStart,
                currentPeriodEnd: data.currentPeriodEnd,
                cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
                paymentMethod: data.paymentMethod,
                stripeSubscriptionId: data.stripeSubscriptionId,
            },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error creating subscription:", error);
        throw new Error("Failed to create subscription");
    }
};

export const getSubscriptionById = async (id: string): Promise<Subscription | null> => {
    try {
        return await prisma.subscription.findUnique({
            where: { id },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error fetching subscription:", error);
        throw new Error("Failed to get subscription");
    }
};

export const getSubscriptionsByUserId = async (userId: string): Promise<Subscription[]> => {
    try {
        return await prisma.subscription.findMany({
            where: { userId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching user subscriptions:", error);
        throw new Error("Failed to get user subscriptions");
    }
};

export const updateSubscription = async (id: string, data: UpdateSubscriptionData): Promise<Subscription> => {
    try {
        return await prisma.subscription.update({
            where: { id },
            data,
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error updating subscription:", error);
        throw new Error("Failed to update subscription");
    }
};

export const deleteSubscription = async (id: string): Promise<Subscription> => {
    try {
        return await prisma.subscription.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting subscription:", error);
        throw new Error("Failed to delete subscription");
    }
};

export const getSubscriptionByStripeId = async (stripeSubscriptionId: string): Promise<Subscription | null> => {
    try {
        return await prisma.subscription.findUnique({
            where: { stripeSubscriptionId },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error fetching subscription by Stripe ID:", error);
        throw new Error("Failed to get subscription by Stripe ID");
    }
};

export const getActiveSubscriptionByUserId = async (userId: string): Promise<Subscription | null> => {
    try {
        return await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                currentPeriodEnd: { gte: new Date() }
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching active subscription:", error);
        throw new Error("Failed to get active subscription");
    }
};

const subscriptionRepository: SubscriptionRepository = {
    createSubscription,
    getSubscriptionById,
    getSubscriptionsByUserId,
    updateSubscription,
    deleteSubscription,
    getSubscriptionByStripeId,
    getActiveSubscriptionByUserId,
};

export default subscriptionRepository;