import { logDate } from '@shared/utils/log-date';

export class Logger {
  static info(...args: any[]) {
    // 1. Prepend log prefix
    args.unshift(`${logDate()} \x1b[36m[info]\x1b[0m`);

    // 2. Pass along arguments to console.log
    console.log.apply(console, args);
  }

  static warning(...args: any[]) {
    // 1. Prepend log prefix
    args.unshift(`${logDate()} \x1b[33m[warning]\x1b[0m`);

    // 2. Pass along arguments to console.warn
    console.warn.apply(console, args);
  }

  static error(...args: any[]) {
    // 1. Prepend log prefix
    args.unshift(`${logDate()} \x1b[31m[error]\x1b[0m`);

    // 2. Pass along arguments to console.error
    console.error.apply(console, args);
  }

  static success(...args: any[]) {
    // 1. Prepend log prefix
    args.unshift(`${logDate()} \x1b[32m[success]\x1b[0m`);

    // 2. Pass along arguments to console.error
    console.log.apply(console, args);
  }
}
