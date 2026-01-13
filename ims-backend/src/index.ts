import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import config from './config/env';
import logger from './config/logger';
import { generalLimiter } from './middleware/rateLimiter';
import { httpLogger, errorLogger } from './middleware/logger';
import { requestContext } from './middleware/requestContext';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import userRoutes from './routes/user.routes';
import aiRoutes from './routes/ai.routes';
import settingsRoutes from './routes/settings.routes';
import seedRoutes from './routes/seed.routes';
import { initializeDatabase } from './config/database';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

// Middleware
app.use(cors({
    origin: config.frontendUrl,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request context (adds request ID)
app.use(requestContext);

// HTTP request logging
app.use(httpLogger);

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'IMS Backend API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.get('/api', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to IMS API',
        version: '1.0.0'
    });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Sales routes
app.use('/api/sales', saleRoutes);

// User management routes (Admin only)
app.use('/api/users', userRoutes);

// AI Agent routes
app.use('/api/ai', aiRoutes);

// Settings routes
app.use('/api/settings', settingsRoutes);

// Seed route (for production database initialization)
app.use('/api/seed', seedRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'IMS API Documentation',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// 404 handler for undefined routes (must be before error handler)
app.use(notFoundHandler);

// Error logging middleware
app.use(errorLogger);

// Global error handler (must be last)
app.use(globalErrorHandler);

// Initialize database and start server
const startServer = async () => {
    try {
        // Initialize TypeORM connection
        await initializeDatabase();
        logger.info('Database connection established successfully');

        // Start server
        app.listen(config.port, () => {
            logger.info(`🚀 Server is running on port ${config.port}`);
            logger.info(`📝 API: http://localhost:${config.port}/api`);
            logger.info(`💚 Health: http://localhost:${config.port}/health`);
            logger.info(`📚 Swagger Docs: http://localhost:${config.port}/api-docs`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
