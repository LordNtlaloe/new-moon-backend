// controllers/user-controller.ts
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../repository/interfaces";
import { ErrorHandler } from "../middleware/error-middleware";
import { AuthRequest } from "../../middleware/auth-middleware";

export class AuthController {
    constructor(private userRepository: UserRepository) { }

    private generateTokens(user: any) {
        const JWT_SECRET = process.env.JWT_SECRET;
        const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

        console.log('Checking JWT secrets:', {
            hasJWT_SECRET: !!JWT_SECRET,
            hasJWT_REFRESH_SECRET: !!JWT_REFRESH_SECRET
        });

        if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
            throw new Error('JWT secrets not configured');
        }

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
        console.log('📝 Register endpoint called');

        try {
            const { email, password, firstName, lastName, role, phone } = req.body;
            console.log('Registration data:', { email, firstName, lastName });

            if (!email || !password || !firstName || !lastName) {
                console.log('Missing required fields');
                return res.status(400).json({
                    success: false,
                    error: "Email, password, first name, and last name are required"
                });
            }

            // Check if user already exists
            const existingUser = await this.userRepository.getUserByEmail(email);
            if (existingUser) {
                console.log('User already exists:', email);
                return res.status(409).json({
                    success: false,
                    error: "User already exists with this email"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);
            console.log('Password hashed');

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
            console.log('User created:', user.id);

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user);
            console.log('Tokens generated');

            // Save refresh token to database
            await this.userRepository.updateUser(user.id, { refreshToken });
            console.log('Refresh token saved');

            return res.status(201).json({
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
            console.error('🔥 Registration error:', error);
            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message
            });
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        console.log('🔐 LOGIN ENDPOINT CALLED');
        console.log('Request body:', req.body);

        try {
            const { email, password } = req.body;

            console.log('Processing login for:', email);

            if (!email || !password) {
                console.log('❌ Missing email or password');
                return res.status(400).json({
                    success: false,
                    error: "Email and password are required"
                });
            }

            console.log('🔍 Querying database for user:', email);

            // Find user
            const user = await this.userRepository.getUserByEmail(email);
            console.log('Database result:', user ? `User found: ${user.id}` : 'User NOT found');

            if (!user) {
                console.log('❌ User not found');
                return res.status(401).json({
                    success: false,
                    error: "Invalid credentials"
                });
            }

            console.log('✅ User exists, checking password...');

            // Check password
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('Password check result:', isValidPassword);

            if (!isValidPassword) {
                console.log('❌ Invalid password');
                return res.status(401).json({
                    success: false,
                    error: "Invalid credentials"
                });
            }

            console.log('✅ Password valid, generating tokens...');

            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user);
            console.log('✅ Tokens generated');

            // Update refresh token in database
            await this.userRepository.updateUser(user.id, { refreshToken });
            console.log('✅ Refresh token updated');

            const response = {
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
            };

            console.log('✅ Sending successful login response');

            return res.status(200).json(response);

        } catch (error: any) {
            console.error('🔥 CATCH BLOCK - Login error:', error);
            console.error('Error stack:', error.stack);

            return res.status(500).json({
                success: false,
                error: "Internal server error",
                message: error.message
            });
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        console.log('🔄 Refresh token endpoint called');

        try {
            const { refreshToken } = req.body;
            console.log('Refresh token received');

            if (!refreshToken) {
                console.log('❌ No refresh token provided');
                return res.status(400).json({
                    success: false,
                    error: "Refresh token is required"
                });
            }

            const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
            if (!JWT_REFRESH_SECRET) {
                console.error('❌ JWT_REFRESH_SECRET not configured');
                return res.status(500).json({
                    success: false,
                    error: "Server configuration error"
                });
            }

            const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
                userId: string;
            };
            console.log('Token decoded for user:', decoded.userId);

            const user = await this.userRepository.getUserById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                console.log('❌ Invalid refresh token');
                return res.status(401).json({
                    success: false,
                    error: "Invalid refresh token"
                });
            }

            const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user);

            // Update refresh token in database
            await this.userRepository.updateUser(user.id, { refreshToken: newRefreshToken });
            console.log('✅ New tokens generated');

            return res.json({
                success: true,
                payload: {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
            });
        } catch (error: any) {
            console.error('Refresh token error:', error);
            return res.status(401).json({
                success: false,
                error: "Invalid refresh token"
            });
        }
    }

    async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
        console.log('👤 Get current user called');

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

            return res.json({
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
            console.error('Get current user error:', error);
            return res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        console.log('🚪 Logout endpoint called');

        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Not authenticated"
                });
            }

            // Remove refresh token from database
            await this.userRepository.updateUser(req.user.userId, { refreshToken: null });
            console.log('✅ Refresh token removed');

            return res.json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error: any) {
            console.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                error: "Internal server error"
            });
        }
    }
}