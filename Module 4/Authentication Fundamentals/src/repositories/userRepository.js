const prisma = require('../db/prisma');

class DuplicateEmailError extends Error {}

async function createUser({ name, email, passwordHash }) {
  try {
    return await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new DuplicateEmailError();
    }
    throw error;
  }
}

function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });
}

module.exports = { DuplicateEmailError, createUser, findUserByEmail };
