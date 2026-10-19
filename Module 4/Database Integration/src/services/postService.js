
const postRepository = require('../repositories/postRepository');

async function listPosts() {
  return await postRepository.findAll();
}

async function getPost(id) {
  return await postRepository.findById(Number(id));
}

async function createPost(fields) {
  if (!fields || typeof fields.title !== 'string' || !fields.title.trim()) {
    const error = new Error('Title is required');
    error.statusCode = 422;
    throw error;
  }

  if (
    fields.authorId === undefined ||
    !Number.isInteger(Number(fields.authorId)) ||
    Number(fields.authorId) <= 0
  ) {
    const error = new Error('A valid authorId is required');
    error.statusCode = 422;
    throw error;
  }

  return await postRepository.create({
    title: fields.title.trim(),
    body: typeof fields.body === 'string' ? fields.body : '',
    authorId: Number(fields.authorId)
  });
}

async function updatePost(id, patch) {
  return await postRepository.update(Number(id), patch);
}

async function removePost(id) {
  return await postRepository.remove(Number(id));
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  removePost
};