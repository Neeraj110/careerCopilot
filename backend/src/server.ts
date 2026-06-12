import 'dotenv/config';
import app from './app';
import { config } from './config';
import { prisma } from './infrastructure/prisma';

const startServer = async () => {
  try {
    // Connect to PostgreSQL via Prisma
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Database is connected

    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
