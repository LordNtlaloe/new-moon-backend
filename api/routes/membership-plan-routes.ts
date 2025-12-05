// routes/membership-plan-routes.ts
import { Router } from "express";
import { MembershipPlanController } from "../controllers/membership-plan-controller";
import membershipPlanRepository from "../../repository/membership-plan-repository";
import { authMiddleware, requireRole } from "../../middleware/auth-middleware";

const router = Router();
const membershipPlanController = new MembershipPlanController(membershipPlanRepository);

// Public routes
router.get("/", membershipPlanController.getActiveMembershipPlans.bind(membershipPlanController));
router.get("/all", membershipPlanController.getAllMembershipPlans.bind(membershipPlanController));
router.get("/:id", membershipPlanController.getMembershipPlan.bind(membershipPlanController));

// Admin only routes
router.use(authMiddleware);
router.post("/", requireRole(['ADMIN']), membershipPlanController.createMembershipPlan.bind(membershipPlanController));
router.put("/:id", requireRole(['ADMIN']), membershipPlanController.updateMembershipPlan.bind(membershipPlanController));
router.delete("/:id", requireRole(['ADMIN']), membershipPlanController.deleteMembershipPlan.bind(membershipPlanController));

export default router;