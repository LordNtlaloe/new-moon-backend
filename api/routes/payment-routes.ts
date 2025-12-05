// routes/payment-routes.ts
import { Router } from "express";
import { PaymentController } from "../controllers/payments-controller";
import paymentRepository from "../../repository/payment-repository";
import { authMiddleware, requireRole } from "../../middleware/auth-middleware";

const router = Router();
const paymentController = new PaymentController(paymentRepository);

// All routes require authentication
router.use(authMiddleware);

// Client routes
router.get("/my-payments", paymentController.getUserPayments.bind(paymentController));
router.post("/", paymentController.createPayment.bind(paymentController));

// Admin only routes
router.get("/", requireRole(['ADMIN']), paymentController.getUserPayments.bind(paymentController));
router.get("/:id", requireRole(['ADMIN']), paymentController.getPayment.bind(paymentController));
router.patch("/:id/status", requireRole(['ADMIN']), paymentController.updatePaymentStatus.bind(paymentController));
router.patch("/:id/refund", requireRole(['ADMIN']), paymentController.processRefund.bind(paymentController));

export default router;