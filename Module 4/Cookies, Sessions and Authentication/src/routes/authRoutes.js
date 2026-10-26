const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');
const {
  cookieName,
  cookieOptions,
  ttlMs,
} = require('../session/cookieConfig');

const router = express.Router();

function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

router.post('/login', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'A valid email and password are required' },
    });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = body.password;
  if (
    !isValidEmail(email) ||
    typeof password !== 'string' ||
    password.length === 0 ||
    Buffer.byteLength(password, 'utf8') > 72
  ) {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'A valid email and password are required' },
    });
  }

  const user = await userRepository.findByEmail(email);
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;
  if (!passwordMatches) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
    });
  }

  const session = sessionStore.create(user.id);
  res.cookie(cookieName, session.id, { ...cookieOptions, maxAge: ttlMs });
  return res.status(200).json({ user: safeUser(user) });
});

router.get('/me', requireSession, (req, res) => res.status(200).json({ user: req.authUser }));

router.post('/logout', (req, res) => {
  const sessionId = req.signedCookies && req.signedCookies[cookieName];
  if (typeof sessionId === 'string') sessionStore.destroy(sessionId);

  res.clearCookie(cookieName, cookieOptions);
  return res.status(204).end();
});

module.exports = router;
