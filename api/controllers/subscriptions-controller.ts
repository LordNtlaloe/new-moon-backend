import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import SubscriptionRepository from "@/repo/interfaces/SubscriptionsRepository";
import * as subscriptionBusiness from "../../domain/subscriptions-business";

export class SubscriptionController {
    constructor(private subscriptionRepository: SubscriptionRepository) { }

    async createSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const {
                tier,
                billingCycle,
                amount,
                currency,
                currentPeriodStart,
                currentPeriodEnd,
                paymentMethod,
                stripeSubscriptionId
            } = req.body;
            const userId = req.user!.userId;

            if (!tier || !billingCycle || !amount || !currentPeriodStart || !currentPeriodEnd) {
                throw new ErrorHandler(400, "Tier, billing cycle, amount, and period dates are required");
            }

            const subscriptionData = {
                userId,
                tier,
                billingCycle,
                amount: parseFloat(amount),
                currency: currency || 'LSL',
                currentPeriodStart: new Date(currentPeriodStart),
                currentPeriodEnd: new Date(currentPeriodEnd),
                paymentMethod,
                stripeSubscriptionId,
            };

            const subscription = await subscriptionBusiness.createNewSubscription(
                this.subscriptionRepository,
                subscriptionData
            );

            res.status(201).json({
                success: true,
                payload: { subscription },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getUserSubscriptions(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const subscriptions = await subscriptionBusiness.getUserSubscriptions(
                this.subscriptionRepository,
                userId
            );

            res.json({
                success: true,
                payload: { subscriptions },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const subscription = await subscriptionBusiness.getSubscription(
                this.subscriptionRepository,
                id
            );

            if (!subscription) {
                throw new ErrorHandler(404, "Subscription not found");
            }

            res.json({
                success: true,
                payload: { subscription },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const subscription = await subscriptionBusiness.cancelSubscription(
                this.subscriptionRepository,
                id
            );

            res.json({
                success: true,
                payload: { subscription },
                message: "Subscription will be cancelled at period end",
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateSubscriptionStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                throw new ErrorHandler(400, "Status is required");
            }

            const subscription = await subscriptionBusiness.updateSubscriptionStatus(
                this.subscriptionRepository,
                id,
                status
            );

            res.json({
                success: true,
                payload: { subscription },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getActiveSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const subscription = await subscriptionBusiness.getActiveUserSubscription(
                this.subscriptionRepository,
                userId
            );

            res.json({
                success: true,
                payload: { subscription },
            });
        } catch (error: any) {
            next(error);
        }
    }
}