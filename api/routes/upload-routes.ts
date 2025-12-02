// @/api/routes/upload-routes.ts
import { Router } from "express";
import { UploadController } from "../controllers/upload-controller";
import { authMiddleware } from "../../middleware/auth-middleware";
import multer from "multer";

const router = Router();
const uploadController = new UploadController();
const upload = multer({ dest: 'uploads/' });

// Protected routes for uploads
router.get("/upload/signature", authMiddleware, (req, res, next) =>
    uploadController.generateSignature(req, res, next)
);

router.post("/upload/profile",
    authMiddleware,
    upload.single('image') as any, // Type assertion as a quick fix
    (req, res, next) => uploadController.uploadProfilePicture(req, res, next)
);

router.delete("/upload/profile", authMiddleware, (req, res, next) =>
    uploadController.deleteProfilePicture(req, res, next)
);

export default router;