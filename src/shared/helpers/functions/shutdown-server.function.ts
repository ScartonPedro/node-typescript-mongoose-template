import { Server } from 'http';

import { connection } from 'mongoose';

import { Logger } from '../classes/logger.class';

export const shutdownServer = (
  message = '💥 Shutting down...',
  server: Server | undefined,
  error?: Error
) => {
  if (error) {
    Logger.error(message);
    Logger.error(`${error.name} ${error.message}`);
  } else {
    Logger.warning(message);
  }

  if (server) {
    server.close(async () => {
      await connection.close();
      Logger.warning('💥 Process terminated');
      process.exit(error ? 1 : 0);
    });
  }
};
