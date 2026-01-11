import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'IMS (Inventory Management System) API',
            version: '1.0.0',
            description: 'A comprehensive Inventory Management System API for managing products, variants, sales, and users',
            contact: {
                name: 'API Support',
                email: 'admin@ims.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: 'Development server',
            },
            {
                url: 'https://your-production-url.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token obtained from /api/auth/signin',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        phone: { type: 'string' },
                        bio: { type: 'string' },
                        role: { type: 'string', enum: ['ADMIN', 'STAFF'] },
                        isVerified: { type: 'boolean' },
                        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        code: { type: 'string' },
                        name: { type: 'string' },
                        category: { type: 'string' },
                        brand: { type: 'string' },
                        imageUrl: { type: 'string' },
                        variants: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Variant' },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Variant: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        productId: { type: 'string', format: 'uuid' },
                        size: { type: 'string' },
                        color: { type: 'string' },
                        stockQuantity: { type: 'integer' },
                        minStockQuantity: { type: 'integer' },
                        buyingPrice: { type: 'number', format: 'decimal' },
                        sellingPrice: { type: 'number', format: 'decimal' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Sale: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        variantId: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer' },
                        sellingPrice: { type: 'number', format: 'decimal' },
                        totalAmount: { type: 'number', format: 'decimal' },
                        customerName: { type: 'string' },
                        notes: { type: 'string' },
                        saleDate: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
        tags: [
            { name: 'Authentication', description: 'Authentication and user management endpoints' },
            { name: 'Products', description: 'Product and variant management endpoints' },
            { name: 'Sales', description: 'Sales transaction endpoints' },
            { name: 'Users', description: 'User management endpoints (Admin only)' },
        ],
    },
    apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
