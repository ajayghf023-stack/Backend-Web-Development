
'use strict';

// middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 5, // Maximum 5 attempts per IP

  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: true,

  message: 'Too many login attempts. Please try again later.',

  handler: (req, res, next, options) => {
    res.setHeader('Retry-After', Math.ceil(options.windowMs / 1000));

    res.status(429).json({
      message: 'Too many login attempts. Please try again later.'
    });
  }
});

// IMPORTANT:
// The default express-rate-limit store uses in-memory storage.
// In a multi-instance deployment, each server maintains its own
// separate counter. A load balancer may send requests to different
// instances, allowing users to bypass the intended rate limit.
//
// To solve this, use rate-limit-redis with a shared Redis server.
// Configure RedisStore as the store option in rateLimit().
// This ensures all server instances share the same rate-limit
// counters and enforce one consistent limit across the deployment.

module.exports = rateLimiter;
