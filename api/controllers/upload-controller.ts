import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from 'cloudinary';
import { AuthRequest } from "../../middleware/auth-middleware";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadController {
    // Generate Cloudinary signature for frontend upload
    async generateSignature(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            const timestamp = Math.round(new Date().getTime() / 1000);
            const params = {
                timestamp,
                folder: `profile-pictures/${req.user.userId}`,
            };

            const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET as string);

            return res.json({
                success: true,
                payload: {
                    signature,
                    timestamp,
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    folder: params.folder,
                }
            });
        } catch (error: any) {
            console.error('Generate signature error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to generate upload signature"
            });
        }
    }

    // Direct upload endpoint (if you want backend to handle upload)
    async uploadProfilePicture(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: "No image file provided"
                });
            }

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: `profile-pictures/${req.user.userId}`,
                width: 400,
                height: 400,
                crop: 'fill',
                gravity: 'face',
            });

            return res.json({
                success: true,
                payload: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    format: result.format,
                    bytes: result.bytes,
                }
            });
        } catch (error: any) {
            console.error('Upload profile picture error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to upload profile picture"
            });
        }
    }

    // Delete profile picture from Cloudinary
    async deleteProfilePicture(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            const { publicId } = req.body;

            if (!publicId) {
                return res.status(400).json({
                    success: false,
                    error: "Public ID is required"
                });
            }

            // Delete from Cloudinary
            const result = await cloudinary.uploader.destroy(publicId);

            if (result.result === 'ok') {
                return res.json({
                    success: true,
                    message: "Profile picture deleted from Cloudinary"
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: "Failed to delete image from Cloudinary"
                });
            }
        } catch (error: any) {
            console.error('Delete profile picture error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to delete profile picture"
            });
        }
    }
}