// controllers/subscription-controller.ts
import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import * as subscriptionBusiness from "../../domain/subscriptions-business";
import SubscriptionRepository from "../../repository/interfaces/SubscriptionsRepository";

export class SubscriptionController {
    constructor(private subscriptionRepository: SubscriptionRepository) { }

    async createSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tier, billingCycle, amount, currency, paymentMethod, stripeSubscriptionId } = req.body;
            const userId = req.user!.userId;

            if (!tier || !billingCycle || !amount) {
                throw new ErrorHandler(400, "Tier, billing cycle, and amount are required");
            }

            const currentPeriodStart = new Date();
            const currentPeriodEnd = new Date();

            switch (billingCycle) {
                case 'monthly':
                    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
                    break;
                case 'quarterly':
                    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
                    break;
                case 'yearly':
                    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
                    break;
                default:
                    throw new ErrorHandler(400, "Invalid billing cycle");
            }

            const subscriptionData = {
                userId,
                tier,
                billingCycle,
                amount: parseFloat(amount),
                currency: currency || 'LSL',
                currentPeriodStart,
                currentPeriodEnd,
                paymentMethod,
                stripeSubscriptionId,
            };

            const subscription = await subscriptionBusiness.createSubscription(
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
                message: "Subscription cancelled successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateSubscription(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const subscription = await subscriptionBusiness.updateSubscription(
                this.subscriptionRepository,
                id,
                updateData
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