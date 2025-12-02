import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../../repository/interfaces";
import { AuthRequest } from "../../middleware/auth-middleware";

export class UserProfileController {
    constructor(private userRepository: UserRepository) { }

    // Get user profile
    async getUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
        console.log('👤 Get user profile called');

        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            const user = await this.userRepository.getUserById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: "User not found"
                });
            }

            // Return user profile data
            return res.json({
                success: true,
                payload: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    avatar: user.avatar,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                },
            });
        } catch (error: any) {
            console.error('Get user profile error:', error);
            return res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    }

    // Update user profile
    async updateUserProfile(req: AuthRequest, res: Response, next: NextFunction) {
        console.log('✏️ Update user profile called');

        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            const userId = req.user.userId;
            const { firstName, lastName, phone, dateOfBirth, gender } = req.body;

            // Validate required fields
            if (!firstName || !lastName) {
                return res.status(400).json({
                    success: false,
                    error: "First name and last name are required"
                });
            }

            // Build update data
            const updateData: any = {
                firstName,
                lastName,
                phone: phone || null,
                // You'll need to add these fields to your User model
                // dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                // gender: gender || null
            };

            // Update user
            const updatedUser = await this.userRepository.updateUser(userId, updateData);

            return res.json({
                success: true,
                payload: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    phone: updatedUser.phone,
                    avatar: updatedUser.avatar,
                    // dateOfBirth: updatedUser.dateOfBirth,
                    // gender: updatedUser.gender,
                    updatedAt: updatedUser.updatedAt
                },
                message: "Profile updated successfully"
            });
        } catch (error: any) {
            console.error('Update user profile error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to update profile"
            });
        }
    }

    // Update profile picture
    async updateProfilePicture(req: AuthRequest, res: Response, next: NextFunction) {
        console.log('🖼️ Update profile picture called');

        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            const userId = req.user.userId;
            const { avatar } = req.body;

            if (!avatar) {
                return res.status(400).json({
                    success: false,
                    error: "Avatar URL is required"
                });
            }

            // Validate URL (basic validation)
            try {
                new URL(avatar);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid avatar URL"
                });
            }

            // Update only the avatar
            const updatedUser = await this.userRepository.updateUser(userId, { avatar });

            return res.json({
                success: true,
                payload: {
                    avatar: updatedUser.avatar
                },
                message: "Profile picture updated successfully"
            });
        } catch (error: any) {
            console.error('Update profile picture error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to update profile picture"
            });
        }
    }

    // Remove profile picture
    async removeProfilePicture(req: AuthRequest, res: Response, next: NextFunction) {
        console.log('🗑️ Remove profile picture called');

        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            const userId = req.user.userId;

            // Set avatar to null
            const updatedUser = await this.userRepository.updateUser(userId, { avatar: null });

            return res.json({
                success: true,
                payload: {
                    avatar: updatedUser.avatar
                },
                message: "Profile picture removed successfully"
            });
        } catch (error: any) {
            console.error('Remove profile picture error:', error);
            return res.status(500).json({
                success: false,
                error: "Failed to remove profile picture"
            });
        }
    }
}