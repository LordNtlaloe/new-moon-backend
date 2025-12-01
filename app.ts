import express, { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import bodyParser from "body-parser";
import cors from "cors";
import { prisma } from "./database/config";
import { ErrorHandler, handleError } from "./api/middleware/error-middleware";
import routes from "./api/routes";

const app = express();

// Enhanced CORS configuration for React Native development
const isDevelopment = process.env.NODE_ENV !== 'production';

const corsOptions = {
    origin: isDevelopment
        ? true // Allow all origins in development
        : [
            'https://your-production-domain.com',
            // Add your production domains here
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browsers
};

app.use(cors(corsOptions));

// Add request logging middleware for debugging
app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
        origin: req.get('origin'),
        userAgent: req.get('user-agent')
    });
    next();
});

app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use("/api", routes);

app.use(
    (err: ErrorHandler, _req: Request, res: Response, _next: NextFunction) => {
        handleError(err, res);
    }
);

const checkDatabaseConnection = async () => {
    try {
        await prisma.$connect();
        logger.debug("✅ Database connection established successfully");
    } catch (error) {
        logger.error("❌ Unable to connect to the database!", error);
    }
};

checkDatabaseConnection();

export default app;