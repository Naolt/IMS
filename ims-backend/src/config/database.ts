import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './env';
import { User } from '../entities/User';
import { Product } from '../entities/Product';
import { Variant } from '../entities/Variant';
import { Sale } from '../entities/Sale';
import { Settings } from '../entities/Settings';
import logger from './logger';

// Base configuration shared by both databases
const baseConfig = {
    synchronize: config.nodeEnv === 'development', // Auto-create tables in dev
    logging: config.nodeEnv === 'development',
    entities: [User, Product, Variant, Sale, Settings],
    migrations: ['src/migrations/**/*{.ts,.js}'],
    subscribers: [],
};

// Database selection based on DATABASE_TYPE environment variable
// - sqlite: Use SQLite (default, works for both development and production)
// - postgres: Use PostgreSQL (requires DATABASE_URL to be set)
const dataSourceConfig: DataSourceOptions = config.databaseType === 'postgres'
    ? {
          ...baseConfig,
          type: 'postgres',
          url: config.databaseUrl!,
          ssl: {
              rejectUnauthorized: false, // Required for cloud databases
          },
      }
    : {
          ...baseConfig,
          type: 'better-sqlite3',
          database: 'data/local.db', // SQLite file location
      };

export const AppDataSource = new DataSource(dataSourceConfig);

// Initialize the database connection
export const initializeDatabase = async (): Promise<void> => {
    try {
        await AppDataSource.initialize();
        logger.info('✅ Database connection established successfully');
    } catch (error) {
        logger.error('❌ Error during Data Source initialization:', error);
        throw error;
    }
};
