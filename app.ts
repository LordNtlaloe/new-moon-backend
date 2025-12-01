// app.ts
import express, { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import bodyParser from "body-parser";
import cors from "cors";
import { prisma } from "./database/config";
import { ErrorHandler, handleError } from "./api/middleware/error-middleware";
import routes from "./api/routes";

const app = express();

// Enhanced CORS configuration
const corsOptions = {
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Add request/response logging middleware
app.use((req, res, next) => {
    const start = Date.now();

    console.log(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        origin: req.get('origin'),
        userAgent: req.get('user-agent')
    });

    // Override response methods to log
    const oldSend = res.send;
    const oldJson = res.json;

    res.json = function (data: any) {
        const duration = Date.now() - start;
        console.log(`RESPONSE ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
            statusCode: res.statusCode,
            data: data
        });
        return oldJson.call(this, data);
    };

    res.send = function (body: any) {
        const duration = Date.now() - start;
        console.log(`RESPONSE ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
            statusCode: res.statusCode,
            body: body
        });
        return oldSend.call(this, body);
    };

    next();
});

app.use(bodyParser.json());

// ========== TEST ENDPOINTS (MUST COME BEFORE MAIN ROUTES) ==========

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Database test endpoint
app.get('/api/test-db', async (_req, res) => {
    console.log('🔧 /api/test-db endpoint called');
    try {
        await prisma.$connect();
        const userCount = await prisma.user.count();

        return res.json({
            success: true,
            message: 'Database connected successfully',
            userCount,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Database connection error:', error);
        return res.status(500).json({
            success: false,
            error: 'Database connection failed',
            message: error.message
        });
    }
});

// Simple test endpoint
app.get('/api/test-json', (_req, res) => {
    console.log('🔧 /api/test-json endpoint called');
    return res.json({
        success: true,
        message: 'JSON test endpoint works',
        timestamp: new Date().toISOString()
    });
});

// Test login endpoint (to debug the empty response issue)
app.post('/api/test-login', async (req, res) => {
    console.log('🔧 /api/test-login endpoint called with body:', req.body);
    return res.json({
        success: true,
        message: 'Test login endpoint works',
        timestamp: new Date().toISOString(),
        receivedBody: req.body
    });
});

// ========== MAIN ROUTES ==========
app.use("/api", routes);

// ========== ERROR HANDLING ==========
// Error handling middleware
app.use(
    (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
        console.error('Global error handler caught:', err);
        handleError(err, res);
    }
);

// 404 handler (MUST BE LAST)
app.use((req: Request, res: Response) => {
    console.warn(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Check database connection on startup
const checkDatabaseConnection = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database connection established successfully");
    } catch (error) {
        console.error("❌ Unable to connect to the database!", error);
    }
};

checkDatabaseConnection();

export default app;