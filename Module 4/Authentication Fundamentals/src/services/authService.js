const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

const bcryptCost = Number(process.env.BCRYPT_COST || 12);

class RequestValidationError extends Error {
  constructor() {
    super();
    this.statusCode = 400;
  }
}

class InvalidCredentialsError extends Error {
  constructor() {
    super();
    this.statusCode = 401;
  }
}

class DuplicateEmailError extends Error {
  constructor() {
    super();
    this.statusCode = 409;
  }
}

function requireNonEmptyString(value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new RequestValidationError();
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function serializeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new RequestValidationError();
  }
  requireNonEmptyString(input.name);
  requireNonEmptyString(input.email);
  requireNonEmptyString(input.password);

  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  const passwordHash = await bcrypt.hash(input.password, bcryptCost);

  try {
    const user = await userRepository.createUser({ name, email, passwordHash });
    return serializeUser(user);
  } catch (error) {
    if (error instanceof userRepository.DuplicateEmailError) {
      throw new DuplicateEmailError();
    }
    throw error;
  }
}

async function login(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new RequestValidationError();
  }
  requireNonEmptyString(input.email);
  requireNonEmptyString(input.password);

  const user = await userRepository.findUserByEmail(normalizeEmail(input.email));
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new InvalidCredentialsError();
  }

  return serializeUser(user);
}

module.exports = { login, register };
