import SubscriptionRepository, { CreateSubscriptionData } from "@/repo/interfaces/SubscriptionsRepository";
import { Subscription, MembershipStatus } from "@prisma/client";

export const createNewSubscription = async (
    subscriptionRepository: SubscriptionRepository,
    data: CreateSubscriptionData
): Promise<Subscription> => {
    try {
        // Validate period dates
        if (data.currentPeriodStart >= data.currentPeriodEnd) {
            throw new Error("Current period end must be after start");
        }

        // Validate amount
        if (data.amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const subscription = await subscriptionRepository.createSubscription(data);
        return subscription;
    } catch (error: any) {
        console.error("Error creating subscription:", error);
        throw error;
    }
};

export const getUserSubscriptions = async (
    subscriptionRepository: SubscriptionRepository,
    userId: string
): Promise<Subscription[]> => {
    try {
        const subscriptions = await subscriptionRepository.getSubscriptionsByUserId(userId);
        return subscriptions;
    } catch (error: any) {
        console.error("Error fetching user subscriptions:", error);
        throw error;
    }
};

export const getSubscription = async (
    subscriptionRepository: SubscriptionRepository,
    id: string
): Promise<Subscription | null> => {
    try {
        const subscription = await subscriptionRepository.getSubscriptionById(id);
        return subscription;
    } catch (error: any) {
        console.error("Error fetching subscription:", error);
        throw error;
    }
};

export const cancelSubscription = async (
    subscriptionRepository: SubscriptionRepository,
    id: string
): Promise<Subscription> => {
    try {
        const subscription = await subscriptionRepository.updateSubscription(id, {
            cancelAtPeriodEnd: true,
            canceledAt: new Date()
        });
        return subscription;
    } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        throw error;
    }
};

export const updateSubscriptionStatus = async (
    subscriptionRepository: SubscriptionRepository,
    id: string,
    status: MembershipStatus
): Promise<Subscription> => {
    try {
        const subscription = await subscriptionRepository.updateSubscription(id, { status });
        return subscription;
    } catch (error: any) {
        console.error("Error updating subscription status:", error);
        throw error;
    }
};

export const getActiveUserSubscription = async (
    subscriptionRepository: SubscriptionRepository,
    userId: string
): Promise<Subscription | null> => {
    try {
        const subscription = await subscriptionRepository.getActiveSubscriptionByUserId(userId);
        return subscription;
    } catch (error: any) {
        console.error("Error fetching active subscription:", error);
        throw error;
    }
};

export default {
    createNewSubscription,
    getUserSubscriptions,
    getSubscription,
    cancelSubscription,
    updateSubscriptionStatus,
    getActiveUserSubscription,
};