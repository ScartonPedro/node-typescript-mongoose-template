import { Request, Response } from 'express';
import { getClientIp } from '@supercharge/request-ip/dist';

import { logDate } from '@shared/utils/log-date';

// Coloring of different methods for better visualization
const methods: { [key: string]: string } = {
  GET: '\x1b[32mGET\x1b[0m', // Green
  POST: '\x1b[33mPOST\x1b[0m', // Yellow
  PATCH: '\x1b[33mPATCH\x1b[0m', // Yellow
  DELETE: '\x1b[31mDELETE\x1b[0m', // Red
};

// Coloring of different statuses for better visualization
const getStatusFlag = (status: number) => {
  if (status < 400) {
    return '\x1b[32m[success]\x1b[0m';
  }

  if (status < 500) {
    return '\x1b[33m[warning]\x1b[0m';
  }

  return '\x1b[31m[error]\x1b[0m';
};

export default function reqLogger(tokens: any, req: Request, res: Response) {
  return [
    logDate(),
    getStatusFlag(res.statusCode),
    getClientIp(req),
    `${tokens['response-time'](req, res)} ms |`,
    res.statusCode,
    methods[req.method] || req.method,
    decodeURIComponent(req.originalUrl),
  ].join(' ');
}
