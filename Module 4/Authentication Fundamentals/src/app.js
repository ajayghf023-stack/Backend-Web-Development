require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.statusCode === 400 || error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'Request body must be valid JSON with the required fields' },
    });
  }

  if (error.statusCode === 401) {
    return res.status(401).json({
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });
  }

  if (error.statusCode === 409) {
    return res.status(409).json({
      error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists' },
    });
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
  });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`API listening on ${port}`));
}

module.exports = app;
