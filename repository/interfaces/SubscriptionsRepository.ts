// repository/interfaces/SubscriptionRepository.ts
import { Subscription, MembershipTier, MembershipStatus, PaymentMethod } from "@prisma/client";

export interface CreateSubscriptionData {
    userId: string;
    tier: MembershipTier;
    billingCycle: string;
    amount: number;
    currency?: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    paymentMethod?: PaymentMethod;
    stripeSubscriptionId?: string;
}

export interface UpdateSubscriptionData {
    tier?: MembershipTier;
    status?: MembershipStatus;
    billingCycle?: string;
    amount?: number;
    currency?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: Date;
    paymentMethod?: PaymentMethod;
    stripeSubscriptionId?: string;
}

export default interface SubscriptionRepository {
    createSubscription(data: CreateSubscriptionData): Promise<Subscription>;
    getSubscriptionById(id: string): Promise<Subscription | null>;
    getSubscriptionsByUserId(userId: string): Promise<Subscription[]>;
    updateSubscription(id: string, data: UpdateSubscriptionData): Promise<Subscription>;
    deleteSubscription(id: string): Promise<Subscription>;
    getActiveSubscriptionByUserId(userId: string): Promise<Subscription | null>;
    cancelSubscription(id: string): Promise<Subscription>;
}