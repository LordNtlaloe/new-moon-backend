// domain/subscription-business.ts
import SubscriptionRepository, { CreateSubscriptionData, UpdateSubscriptionData } from "../repository/interfaces/SubscriptionsRepository";
import { Subscription, MembershipTier } from "@prisma/client";

export const createSubscription = async (
    subscriptionRepository: SubscriptionRepository,
    data: CreateSubscriptionData
): Promise<Subscription> => {
    try {
        // Validate amount
        if (data.amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        // Check if user already has an active subscription
        const activeSubscription = await subscriptionRepository.getActiveSubscriptionByUserId(data.userId);
        if (activeSubscription) {
            // Cancel current subscription if upgrading
            if (data.tier !== activeSubscription.tier) {
                await subscriptionRepository.cancelSubscription(activeSubscription.id);
            } else {
                throw new Error("User already has an active subscription for this tier");
            }
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

export const cancelSubscription = async (
    subscriptionRepository: SubscriptionRepository,
    id: string
): Promise<Subscription> => {
    try {
        const subscription = await subscriptionRepository.cancelSubscription(id);
        return subscription;
    } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        throw error;
    }
};

export const updateSubscription = async (
    subscriptionRepository: SubscriptionRepository,
    id: string,
    data: UpdateSubscriptionData
): Promise<Subscription> => {
    try {
        if (data.amount !== undefined && data.amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const subscription = await subscriptionRepository.updateSubscription(id, data);
        return subscription;
    } catch (error: any) {
        console.error("Error updating subscription:", error);
        throw error;
    }
};