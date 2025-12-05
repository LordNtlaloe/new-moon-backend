import { MembershipTier } from "@prisma/client";
import { ErrorHandler } from "../api/middleware/error-middleware";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
        membershipTier?: MembershipTier;

    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        const token = authHeader.substring(7);
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            return next(new ErrorHandler(500, "JWT secret not configured"));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };

        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        next(new ErrorHandler(401, "Invalid or expired token"));
    }
};

export const requireRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new ErrorHandler(401, "Authentication required"));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(403, "Insufficient permissions"));
        }

        next();
    };
};