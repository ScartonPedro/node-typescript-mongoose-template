import { Router, json, urlencoded } from 'express';

// Importing middlewares
import compression from 'compression';
import helmet from 'helmet';
import MongoSanitize from 'express-mongo-sanitize';
import Cors from 'cors';
import Morgan from 'morgan';

// Funtions
import reqLogger from '@shared/helpers/functions/req-logger.function';

const router = Router();

// Set up CORS Access
router.use(Cors({ credentials: true, origin: true }));

// Set up logger
router.use(Morgan(reqLogger));

// Set security HTTP Headers
router.use(helmet({ contentSecurityPolicy: false, xssFilter: true }));

// Set json bundle reader
router.use(json({ limit: '500kb' }));
router.use(urlencoded({ extended: true }));

// Data sanitization against NoSQL injection
// TODOS LOS REQ BODYS QUE TENGAN ALGUNA LLAVE CON . O $ SERAN CAMBIADOS POR UN _
router.use(MongoSanitize({ replaceWith: '_' }));

// Compression
router.use(compression());

export default router;
