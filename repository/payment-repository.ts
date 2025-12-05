// repository/payment-repository.ts
import { PrismaClient, Payment, PaymentStatus } from "@prisma/client";
import PaymentRepository, { CreatePaymentData, UpdatePaymentData } from "./interfaces/PaymentRepository";

const prisma = new PrismaClient();

export const createPayment = async (data: CreatePaymentData): Promise<Payment> => {
    try {
        return await prisma.payment.create({
            data: {
                userId: data.userId,
                amount: data.amount,
                currency: data.currency || 'LSL',
                paymentMethod: data.paymentMethod,
                status: data.status || 'PENDING',
                transactionId: data.transactionId,
                stripePaymentId: data.stripePaymentId,
                description: data.description,
                metadata: data.metadata,
                receiptUrl: data.receiptUrl,
                invoiceNumber: data.invoiceNumber,
            },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error creating payment:", error);
        throw new Error("Failed to create payment");
    }
};

export const getPaymentById = async (id: string): Promise<Payment | null> => {
    try {
        return await prisma.payment.findUnique({
            where: { id },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error fetching payment:", error);
        throw new Error("Failed to get payment");
    }
};

export const getPaymentsByUserId = async (userId: string): Promise<Payment[]> => {
    try {
        return await prisma.payment.findMany({
            where: { userId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching user payments:", error);
        throw new Error("Failed to get user payments");
    }
};

export const updatePayment = async (id: string, data: UpdatePaymentData): Promise<Payment> => {
    try {
        return await prisma.payment.update({
            where: { id },
            data,
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error updating payment:", error);
        throw new Error("Failed to update payment");
    }
};

export const deletePayment = async (id: string): Promise<Payment> => {
    try {
        return await prisma.payment.delete({
            where: { id }
        });
    } catch (error: any) {
        console.error("Error deleting payment:", error);
        throw new Error("Failed to delete payment");
    }
};

export const getPaymentsByStatus = async (status: PaymentStatus): Promise<Payment[]> => {
    try {
        return await prisma.payment.findMany({
            where: { status },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error: any) {
        console.error("Error fetching payments by status:", error);
        throw new Error("Failed to get payments by status");
    }
};

export const getPaymentByTransactionId = async (transactionId: string): Promise<Payment | null> => {
    try {
        return await prisma.payment.findUnique({
            where: { transactionId },
            include: { user: true }
        });
    } catch (error: any) {
        console.error("Error fetching payment by transaction ID:", error);
        throw new Error("Failed to get payment by transaction ID");
    }
};

const paymentRepository: PaymentRepository = {
    createPayment,
    getPaymentById,
    getPaymentsByUserId,
    updatePayment,
    deletePayment,
    getPaymentsByStatus,
    getPaymentByTransactionId,
};

export default paymentRepository;