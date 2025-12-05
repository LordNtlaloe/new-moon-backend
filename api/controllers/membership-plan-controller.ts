// controllers/membership-plan-controller.ts
import { Request, Response, NextFunction } from "express";
import MembershipPlanRepository from "../../repository/interfaces/MembershipPlanRepository";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import * as membershipPlanBusiness from "../../domain/membership-plan-business";

export class MembershipPlanController {
    constructor(private membershipPlanRepository: MembershipPlanRepository) { }

    async createMembershipPlan(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const {
                name,
                tier,
                description,
                monthlyPrice,
                quarterlyPrice,
                yearlyPrice,
                currency,
                features,
                maxWorkouts,
                maxVideos,
                hasPersonalTraining,
                hasNutritionPlan,
                isActive
            } = req.body;

            if (!name || !tier || !monthlyPrice) {
                throw new ErrorHandler(400, "Name, tier, and monthly price are required");
            }

            const planData = {
                name,
                tier,
                description,
                monthlyPrice: parseFloat(monthlyPrice),
                quarterlyPrice: quarterlyPrice ? parseFloat(quarterlyPrice) : undefined,
                yearlyPrice: yearlyPrice ? parseFloat(yearlyPrice) : undefined,
                currency: currency || 'LSL',
                features: typeof features === 'string' ? JSON.parse(features) : features,
                maxWorkouts,
                maxVideos,
                hasPersonalTraining: hasPersonalTraining || false,
                hasNutritionPlan: hasNutritionPlan || false,
                isActive: isActive !== undefined ? isActive : true,
            };

            const plan = await membershipPlanBusiness.createMembershipPlan(
                this.membershipPlanRepository,
                planData
            );

            res.status(201).json({
                success: true,
                payload: { plan },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getAllMembershipPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const plans = await membershipPlanBusiness.getAllMembershipPlans(
                this.membershipPlanRepository
            );

            res.json({
                success: true,
                payload: { plans },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getActiveMembershipPlans(req: Request, res: Response, next: NextFunction) {
        try {
            const plans = await membershipPlanBusiness.getActiveMembershipPlans(
                this.membershipPlanRepository
            );

            res.json({
                success: true,
                payload: { plans },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getMembershipPlan(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await membershipPlanBusiness.getMembershipPlan(
                this.membershipPlanRepository,
                id
            );

            if (!plan) {
                throw new ErrorHandler(404, "Membership plan not found");
            }

            res.json({
                success: true,
                payload: { plan },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateMembershipPlan(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const plan = await membershipPlanBusiness.updateMembershipPlan(
                this.membershipPlanRepository,
                id,
                updateData
            );

            res.json({
                success: true,
                payload: { plan },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async deleteMembershipPlan(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const plan = await membershipPlanBusiness.deleteMembershipPlan(
                this.membershipPlanRepository,
                id
            );

            res.json({
                success: true,
                payload: { plan },
                message: "Membership plan deleted successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }
}