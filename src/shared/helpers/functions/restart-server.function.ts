import { Logger } from '../classes/logger.class';

export const restartServer = () => {
  Logger.info('Restarting app.');
  setTimeout(function () {
    // When NodeJS exits
    process.on('exit', function () {
      require('child_process').spawn(process.argv.shift(), process.argv, {
        cwd: process.cwd(),
        detached: true,
        stdio: 'inherit',
      });
    });
    process.exit();
  }, 1000);
};
