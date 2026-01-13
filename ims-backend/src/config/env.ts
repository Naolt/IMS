import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Validate database configuration
const databaseType = process.env.DATABASE_TYPE || 'sqlite';
if (databaseType === 'postgres' && !process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required when DATABASE_TYPE is set to "postgres"');
}

// Export all environment variables with defaults
export const config = {
    // Server
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    databaseType: databaseType as 'sqlite' | 'postgres',
    databaseUrl: process.env.DATABASE_URL,

    // JWT
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET!,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

    // Email
    resendApiKey: process.env.RESEND_API_KEY || '',

    // Frontend
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
} as const;

export default config;
