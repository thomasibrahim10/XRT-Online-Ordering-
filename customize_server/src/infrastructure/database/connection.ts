import mongoose from 'mongoose';
import { env } from '../../shared/config/env';
import { logger } from '../../shared/utils/logger';
import { permissionRegistry } from '../../shared/permissions/PermissionRegistry';

let isConnected = false;
let retryCount = 0;
let handlersRegistered = false;
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority' as any,
  autoIndex: env.NODE_ENV !== 'production',
};

const setupEventHandlers = () => {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    retryCount = 0;
    logger.info('✅ MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
    isConnected = false;

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`⏳ Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectDatabase, RETRY_DELAY);
    } else {
      logger.error('❌ Max reconnection attempts reached. Please check your MongoDB connection.');
      // throw new Error('Max reconnection attempts reached');
    }
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected');
    isConnected = false;

    if (retryCount < MAX_RETRIES) {
      retryCount++;
      logger.info(`⏳ Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
      setTimeout(connectDatabase, RETRY_DELAY);
    }
  });

  // SIGINT handler removed for serverless compatibility
};

/**
 * Sync permissions with database after successful connection
 */
const syncPermissions = async (): Promise<void> => {
  try {
    if (!permissionRegistry.isSynced()) {
      await permissionRegistry.syncWithDatabase();
    }
  } catch (error: any) {
    logger.error(`❌ Failed to sync permissions: ${error.message}`);
    // Don't throw - permission sync failure shouldn't prevent server from running
  }
};

export const connectDatabase = async (): Promise<void> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('🟢 Using existing MongoDB connection');
    return;
  }

  if (!env.MONGO_URI) {
    logger.error('❌ MONGO_URI is not defined in environment variables');
    throw new Error('MONGO_URI is not defined');
  }

  try {
    logger.info('🔌 Attempting to connect to MongoDB...');

    // Only disconnect if we are in a state that requires it (e.g. disconnecting)
    // If we are connecting (2), we might want to wait, but for now let's assume we want a fresh start
    // or if we rely on the check at the top (isConnected && readyState === 1), we are good.
    // However, specifically for serverless, frequent disconnects/reconnects are bad if we are just "connecting".

    if (mongoose.connection.readyState !== 0 && mongoose.connection.readyState !== 2) {
      await mongoose.disconnect();
    }

    const connectWithRetry = async (attempt = 1): Promise<void> => {
      try {
        await mongoose.connect(env.MONGO_URI, mongooseOptions);
        logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        isConnected = true;
        retryCount = 0;

        // Sync permissions after successful connection
        await syncPermissions();
      } catch (err: any) {
        if (attempt < MAX_RETRIES) {
          logger.info(
            `⏳ Connection attempt ${attempt} failed. Retrying in ${RETRY_DELAY / 1000} seconds...`
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return connectWithRetry(attempt + 1);
        }
        logger.error(`❌ Failed to connect to MongoDB after multiple attempts: ${err.message}`);
        throw new Error(`Failed to connect to MongoDB: ${err.message}`);
      }
    };

    if (!handlersRegistered) {
      setupEventHandlers();
      handlersRegistered = true;
    }
    await connectWithRetry();
  } catch (error: any) {
    logger.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't exit process, just log. The request will fail but the potential for recovery or better logging remains.
  }
};
