// controllers/payment-controller.ts
import { Request, Response, NextFunction } from "express";
import PaymentRepository from "../../repository/interfaces/PaymentRepository";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";
import * as paymentBusiness from "../../domain/payments-business";

export class PaymentController {
    constructor(private paymentRepository: PaymentRepository) { }

    async createPayment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const {
                amount,
                currency,
                paymentMethod,
                transactionId,
                stripePaymentId,
                description,
                metadata,
                receiptUrl
            } = req.body;

            const userId = req.user!.userId;

            if (!amount || !paymentMethod) {
                throw new ErrorHandler(400, "Amount and payment method are required");
            }

            const paymentData = {
                userId,
                amount: parseFloat(amount),
                currency: currency || 'LSL',
                paymentMethod,
                transactionId,
                stripePaymentId,
                description,
                metadata,
                receiptUrl,
                invoiceNumber: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            };

            const payment = await paymentBusiness.createPayment(
                this.paymentRepository,
                paymentData
            );

            res.status(201).json({
                success: true,
                payload: { payment },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getUserPayments(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const payments = await paymentBusiness.getUserPayments(
                this.paymentRepository,
                userId
            );

            res.json({
                success: true,
                payload: { payments },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async getPayment(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const payment = await paymentBusiness.getPayment(
                this.paymentRepository,
                id
            );

            if (!payment) {
                throw new ErrorHandler(404, "Payment not found");
            }

            res.json({
                success: true,
                payload: { payment },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async updatePaymentStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { status, failureReason, refundedAt } = req.body;

            if (!status) {
                throw new ErrorHandler(400, "Status is required");
            }

            const updateData = {
                status,
                failureReason,
                refundedAt: refundedAt ? new Date(refundedAt) : undefined
            };

            const payment = await paymentBusiness.updatePaymentStatus(
                this.paymentRepository,
                id,
                updateData
            );

            res.json({
                success: true,
                payload: { payment },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async processRefund(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            const payment = await paymentBusiness.processRefund(
                this.paymentRepository,
                id
            );

            res.json({
                success: true,
                payload: { payment },
                message: "Refund processed successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }
}