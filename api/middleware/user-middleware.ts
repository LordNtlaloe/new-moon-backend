// middleware/auth-middleware.ts
import { Request, Response, NextFunction } from "express";
import { ErrorHandler } from "./error-middleware";

class ClerkAuthService {
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://api.clerk.com/v1';

    constructor() {
        this.apiKey = process.env.CLERK_SECRET_KEY || '';
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
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
                return { sub: data.sub }; // Return user ID
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

        const token = authHeader.substring(7); // Remove "Bearer " prefix

        // Verify the token with Clerk REST API
        const session = await clerkAuthService.verifyToken(token);

        if (!session) {
            return next(new ErrorHandler(401, "Invalid authentication"));
        }

        req.clerkId = session.sub; // User ID from Clerk
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(new ErrorHandler(401, "Invalid authentication"));
    }
};

declare global {
    namespace Express {
        interface Request {
            clerkId: string;
        }
    }
}