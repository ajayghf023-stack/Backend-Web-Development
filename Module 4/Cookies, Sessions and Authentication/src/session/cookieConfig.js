require('dotenv').config();

const cookieSecret = process.env.COOKIE_SECRET;
if (!cookieSecret || cookieSecret.length < 32) {
  throw new Error('COOKIE_SECRET must contain at least 32 characters');
}

const ttlMs = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);
if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0) {
  throw new Error('SESSION_TTL_MS must be a positive integer');
}

const configuredSecure = process.env.COOKIE_SECURE;
if (configuredSecure !== undefined && !['true', 'false'].includes(configuredSecure)) {
  throw new Error('COOKIE_SECURE must be either true or false');
}

const secure = process.env.NODE_ENV === 'production' || configuredSecure === 'true';
const cookieOptions = Object.freeze({
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure,
  signed: true,
});

module.exports = {
  cookieName: 'sid',
  cookieSecret,
  ttlMs,
  cookieOptions,
};
