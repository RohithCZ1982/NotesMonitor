import 'dotenv/config';
import app from './app';
import { connectDatabase } from './config/database';
import { logger } from './config/logger';
import { seedAdmin } from './utils/seed';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    await seedAdmin();

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

bootstrap();
