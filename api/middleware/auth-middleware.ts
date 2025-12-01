// middleware/auth-middleware.ts
import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "../middleware/error-middleware";

class ClerkAuthService {
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://api.clerk.com/v1';

    constructor() {
        this.apiKey = process.env.CLERK_SECRET_KEY || '';
        if (!this.apiKey) {
            throw new Error('CLERK_SECRET_KEY is required');
        }
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    async verifyToken(token: string): Promise<{ sub: string } | null> {
        try {
            const response = await fetch(`${this.baseUrl}/sessions/${token}/verify`, {
                method: 'POST',
                headers: this.getHeaders(),
            });

            if (response.ok) {
                const data = await response.json();
                return { sub: data.sub };
            }
            return null;
        } catch (error) {
            console.error('Error verifying token:', error);
            return null;
        }
    }
}

const clerkAuthService = new ClerkAuthService();

export const clerkAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        const token = authHeader.substring(7);

        // Verify the token with Clerk REST API
        const session = await clerkAuthService.verifyToken(token);

        if (!session) {
            return next(new ErrorHandler(401, "Invalid authentication"));
        }

        req.clerkId = session.sub;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(new ErrorHandler(401, "Invalid authentication"));
    }
};

// Alternative simple middleware for development
export const devAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        // For development, just extract from header
        const token = authHeader.substring(7);

        // Simple validation - in production, use proper Clerk verification
        if (token && token.length > 10) {
            req.clerkId = `dev-user-${Date.now()}`;
            next();
        } else {
            return next(new ErrorHandler(401, "Invalid authentication"));
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(new ErrorHandler(401, "Invalid authentication"));
    }
};