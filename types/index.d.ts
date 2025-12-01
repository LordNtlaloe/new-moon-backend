import { User } from '@prisma/client';

export interface AuthUser {
    userId: string;
    sessionId: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            auth?: AuthUser;
        }
    }
}
