// domain/payment-business.ts
import PaymentRepository, { CreatePaymentData, UpdatePaymentData } from "@/repo/interfaces/PaymentRepository";
import { Payment, PaymentStatus } from "@prisma/client";

export const createPayment = async (
    paymentRepository: PaymentRepository,
    data: CreatePaymentData
): Promise<Payment> => {
    try {
        // Validate amount
        if (data.amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const payment = await paymentRepository.createPayment(data);
        return payment;
    } catch (error: any) {
        console.error("Error creating payment:", error);
        throw error;
    }
};

export const getUserPayments = async (
    paymentRepository: PaymentRepository,
    userId: string
): Promise<Payment[]> => {
    try {
        const payments = await paymentRepository.getPaymentsByUserId(userId);
        return payments;
    } catch (error: any) {
        console.error("Error fetching user payments:", error);
        throw error;
    }
};

export const getPayment = async (
    paymentRepository: PaymentRepository,
    id: string
): Promise<Payment | null> => {
    try {
        const payment = await paymentRepository.getPaymentById(id);
        return payment;
    } catch (error: any) {
        console.error("Error fetching payment:", error);
        throw error;
    }
};

export const updatePaymentStatus = async (
    paymentRepository: PaymentRepository,
    id: string,
    data: UpdatePaymentData
): Promise<Payment> => {
    try {
        const payment = await paymentRepository.updatePayment(id, data);
        return payment;
    } catch (error: any) {
        console.error("Error updating payment status:", error);
        throw error;
    }
};

export const processRefund = async (
    paymentRepository: PaymentRepository,
    id: string
): Promise<Payment> => {
    try {
        const payment = await paymentRepository.getPaymentById(id);
        if (!payment) {
            throw new Error("Payment not found");
        }

        if (payment.status !== 'COMPLETED') {
            throw new Error("Only completed payments can be refunded");
        }

        if (payment.refundedAt) {
            throw new Error("Payment already refunded");
        }

        const refundedPayment = await paymentRepository.updatePayment(id, {
            status: 'REFUNDED',
            refundedAt: new Date()
        });

        return refundedPayment;
    } catch (error: any) {
        console.error("Error processing refund:", error);
        throw error;
    }
};