import { Router } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth-middleware";
import { SubscriptionController } from "../controllers/subscriptions-controller";
import subscriptionRepository from "../../repository/subscriptions-repository"

const router = Router();
const subscriptionController = new SubscriptionController(subscriptionRepository);

// All routes require authentication
router.use(authMiddleware);

// Client routes
router.get("/my-subscriptions", subscriptionController.getUserSubscriptions.bind(subscriptionController));
router.get("/active", subscriptionController.getActiveSubscription.bind(subscriptionController));
router.post("/", subscriptionController.createSubscription.bind(subscriptionController));
router.patch("/:id/cancel", subscriptionController.cancelSubscription.bind(subscriptionController));

// Admin only routes
router.get("/:id", requireRole(['ADMIN']), subscriptionController.getSubscription.bind(subscriptionController));
router.patch("/:id/status", requireRole(['ADMIN']), subscriptionController.updateSubscriptionStatus.bind(subscriptionController));

export default router;