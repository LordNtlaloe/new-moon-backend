// types/express.d.ts
import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            clerkId: string;
        }
    }
}

// This export is important
export { };