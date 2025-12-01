// middleware/webhook-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Webhook } from 'svix';
import { ErrorHandler } from './error-middleware';

export const clerkWebhookMiddleware = (webhookSecret: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const svixHeaders = {
                'svix-id': req.headers['svix-id'] as string,
                'svix-timestamp': req.headers['svix-timestamp'] as string,
                'svix-signature': req.headers['svix-signature'] as string,
            };

            if (!svixHeaders['svix-id'] || !svixHeaders['svix-timestamp'] || !svixHeaders['svix-signature']) {
                return next(new ErrorHandler(400, 'Missing Svix headers'));
            }

            const wh = new Webhook(webhookSecret);
            const payload = JSON.stringify(req.body);

            try {
                wh.verify(payload, svixHeaders);
                next();
            } catch (err) {
                return next(new ErrorHandler(400, 'Invalid webhook signature'));
            }
        } catch (error) {
            next(new ErrorHandler(500, 'Webhook verification failed'));
        }
    };
};