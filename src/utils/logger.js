const winston = require('winston');

const APP_LOGS_PATH = process.env.APP_LOG_PATH || '../../logs';
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: APP_LOGS_PATH+'/error.log', level: 'error' }),
    new winston.transports.File({ filename: APP_LOGS_PATH+'/combined.log' }),
  ],
});

module.exports = logger;
