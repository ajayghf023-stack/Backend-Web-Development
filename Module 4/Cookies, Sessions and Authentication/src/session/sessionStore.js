const { randomBytes } = require('crypto');
const { ttlMs } = require('./cookieConfig');

const sessions = new Map();

function create(userId) {
  const now = Date.now();
  for (const [sessionId, session] of sessions) {
    if (session.expiresAt <= now) sessions.delete(sessionId);
  }

  let id;
  do {
    id = randomBytes(32).toString('hex');
  } while (sessions.has(id));

  const session = { userId, expiresAt: now + ttlMs };
  sessions.set(id, session);
  return { id, ...session };
}

function get(id) {
  if (typeof id !== 'string') return null;

  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }

  return session;
}

function destroy(id) {
  if (typeof id === 'string') sessions.delete(id);
}

module.exports = { create, get, destroy };
