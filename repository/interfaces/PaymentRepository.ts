// repository/interfaces/PaymentRepository.ts
import { Payment, PaymentStatus, PaymentMethod } from "@prisma/client";

export interface CreatePaymentData {
    userId: string;
    amount: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    status?: PaymentStatus;
    transactionId?: string;
    stripePaymentId?: string;
    description?: string;
    metadata?: any;
    receiptUrl?: string;
    invoiceNumber?: string;
}

export interface UpdatePaymentData {
    amount?: number;
    status?: PaymentStatus;
    transactionId?: string;
    stripePaymentId?: string;
    description?: string;
    metadata?: any;
    receiptUrl?: string;
    invoiceNumber?: string;
    failureReason?: string;
    refundedAt?: Date;
}

export default interface PaymentRepository {
    createPayment(data: CreatePaymentData): Promise<Payment>;
    getPaymentById(id: string): Promise<Payment | null>;
    getPaymentsByUserId(userId: string): Promise<Payment[]>;
    updatePayment(id: string, data: UpdatePaymentData): Promise<Payment>;
    deletePayment(id: string): Promise<Payment>;
    getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]>;
    getPaymentByTransactionId(transactionId: string): Promise<Payment | null>;
}