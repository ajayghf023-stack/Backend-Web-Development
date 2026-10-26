const userRepository = require('../repositories/userRepository');
const sessionStore = require('../session/sessionStore');
const { cookieName } = require('../session/cookieConfig');

function reject(res) {
  return res.status(401).json({
    error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
  });
}

module.exports = async function requireSession(req, res, next) {
  const sessionId = req.signedCookies && req.signedCookies[cookieName];
  if (typeof sessionId !== 'string') return reject(res);

  const session = sessionStore.get(sessionId);
  if (!session) return reject(res);

  const user = await userRepository.findById(session.userId);
  if (!user) {
    sessionStore.destroy(sessionId);
    return reject(res);
  }

  req.authUser = { id: user.id, name: user.name, email: user.email };
  return next();
};