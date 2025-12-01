import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../repository/interfaces";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";

export class AuthController {
    constructor(private userRepository: UserRepository) { }

    private generateTokens(user: any) {
        const JWT_SECRET = process.env.JWT_SECRET!;
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

        const accessToken = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            {
                userId: user.id,
            },
            JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, firstName, lastName, role, phone } = req.body;

            if (!email || !password || !firstName || !lastName) {
                throw new ErrorHandler(400, "Email, password, first name, and last name are required");
            }

            // Check if user already exists
            const existingUser = await this.userRepository.getUserByEmail(email);
            if (existingUser) {
                throw new ErrorHandler(409, "User already exists with this email");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user
            const userData = {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'CLIENT',
                phone,
            };

            const user = await this.userRepository.createUser(userData);

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user);

            // Save refresh token to database
            await this.userRepository.updateUser(user.id, { refreshToken });

            res.status(201).json({
                success: true,
                payload: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        phone: user.phone,
                        avatar: user.avatar,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new ErrorHandler(400, "Email and password are required");
            }

            // Find user
            const user = await this.userRepository.getUserByEmail(email);
            if (!user) {
                throw new ErrorHandler(401, "Invalid credentials");
            }

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new ErrorHandler(401, "Invalid credentials");
            }

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user);

            // Update refresh token in database
            await this.userRepository.updateUser(user.id, { refreshToken });

            res.json({
                success: true,
                payload: {
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        phone: user.phone,
                        avatar: user.avatar,
                    },
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                throw new ErrorHandler(400, "Refresh token is required");
            }

            const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
                userId: string;
            };

            const user = await this.userRepository.getUserById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                throw new ErrorHandler(401, "Invalid refresh token");
            }

            const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

            // Update refresh token in database
            await this.userRepository.updateUser(user.id, { refreshToken: newRefreshToken });

            res.json({
                success: true,
                payload: {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
            });
        } catch (error: any) {
            next(new ErrorHandler(401, "Invalid refresh token"));
        }
    }

    async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userRepository.getUserById(req.user!.userId);

            if (!user) {
                throw new ErrorHandler(404, "User not found");
            }

            res.json({
                success: true,
                payload: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                },
            });
        } catch (error: any) {
            next(error);
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            // Remove refresh token from database
            await this.userRepository.updateUser(req.user!.userId, { refreshToken: null });

            res.json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }
}