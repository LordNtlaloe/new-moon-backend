import { Router } from "express";
import { UserProfileController } from "../controllers/user-profile-controller";
import userRepository from "../../repository/user-repository";
import { authMiddleware } from "../../middleware/auth-middleware";

const router = Router();
const userProfileController = new UserProfileController(userRepository);

// Protected routes for user profile
router.get("/profile", authMiddleware, (req, res, next) =>
    userProfileController.getUserProfile(req, res, next)
);

router.put("/profile", authMiddleware, (req, res, next) =>
    userProfileController.updateUserProfile(req, res, next)
);

router.put("/profile/picture", authMiddleware, (req, res, next) =>
    userProfileController.updateProfilePicture(req, res, next)
);

router.delete("/profile/picture", authMiddleware, (req, res, next) =>
    userProfileController.removeProfilePicture(req, res, next)
);

export default router;