import { Router } from "express";
import { MembershipController } from "../controllers/membership-controller";
import membershipRepository from "../../repository/membership-repository";
import { authMiddleware, requireRole } from "../../middleware/auth-middleware";

const router = Router();
const membershipController = new MembershipController(membershipRepository);

// All routes require authentication
router.use(authMiddleware);

// Client routes
router.get("/my-memberships", membershipController.getUserMemberships.bind(membershipController));
router.get("/active", membershipController.getActiveMembership.bind(membershipController));
router.post("/", membershipController.createMembership.bind(membershipController));
router.patch("/:id/cancel", membershipController.cancelMembership.bind(membershipController));

// Admin only routes
router.get("/:id", requireRole(['ADMIN']), membershipController.getMembership.bind(membershipController));
router.patch("/:id/status", requireRole(['ADMIN']), membershipController.updateMembershipStatus.bind(membershipController));

export default router;