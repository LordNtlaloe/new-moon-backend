// routes/subscription-routes.ts
import { Router } from "express";
import { SubscriptionController } from "../controllers/subscriptions-controller";
import subscriptionRepository from "../../repository/subscriptions-repository";
import { authMiddleware, requireRole } from "../../middleware/auth-middleware";

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
router.get("/:id", requireRole(['ADMIN']), subscriptionController.getUserSubscriptions.bind(subscriptionController));
router.put("/:id", requireRole(['ADMIN']), subscriptionController.updateSubscription.bind(subscriptionController));

export default router;