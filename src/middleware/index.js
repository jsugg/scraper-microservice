const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const express = require('express');

// Export your middleware configuration

module.exports = (app) => {
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 200 requests per windowMs
  });
  app.use(limiter);
  app.use(express.json());
  app.use(cors());
};
