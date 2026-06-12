import 'dotenv/config';
import app from './app';
import { config } from './config';
import { prisma } from './infrastructure/prisma';
import { chroma } from './infrastructure/chroma';

const startServer = async () => {
  try {
    // Connect to PostgreSQL via Prisma
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    // Verify ChromaDB is reachable
    try {
      await chroma.heartbeat();
      console.log('✅ Connected to ChromaDB');
    } catch (err) {
      console.warn('⚠️  ChromaDB not reachable — vector features will fail until it is available');
    }

    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
