import { Request, Response, NextFunction } from "express";
import MembershipRepository from "../../repository/interfaces/MembershipRepository";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import * as membershipBusiness from "../../domain/membership-business";

export class MembershipController {
    constructor(private membershipRepository: MembershipRepository) { }

    async createMembership(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tier, startDate, endDate, autoRenew, amount, currency } = req.body;
            const userId = req.user!.userId;

            if (!tier || !startDate || !endDate || !amount) {
                throw new ErrorHandler(400, "Tier, start date, end date, and amount are required");
            }

            const membershipData = {
                userId,
                tier,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                autoRenew: autoRenew ?? true,
                amount: parseFloat(amount),
                currency: currency || 'LSL',
            };

            const membership = await membershipBusiness.createNewMembership(
                this.membershipRepository,
                membershipData
            );

            res.status(201).json({
                success: true,
                payload: { membership },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getUserMemberships(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const memberships = await membershipBusiness.getUserMemberships(
                this.membershipRepository,
                userId
            );

            res.json({
                success: true,
                payload: { memberships },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getMembership(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const membership = await membershipBusiness.getMembership(
                this.membershipRepository,
                id
            );

            if (!membership) {
                throw new ErrorHandler(404, "Membership not found");
            }

            res.json({
                success: true,
                payload: { membership },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updateMembershipStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                throw new ErrorHandler(400, "Status is required");
            }

            const membership = await membershipBusiness.updateMembershipStatus(
                this.membershipRepository,
                id,
                status
            );

            res.json({
                success: true,
                payload: { membership },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async cancelMembership(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const membership = await membershipBusiness.cancelMembership(
                this.membershipRepository,
                id
            );

            res.json({
                success: true,
                payload: { membership },
                message: "Membership cancelled successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getActiveMembership(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const membership = await membershipBusiness.getActiveUserMembership(
                this.membershipRepository,
                userId
            );

            res.json({
                success: true,
                payload: { membership },
            });
        } catch (error: any) {
            next(error);
        }
    }
}