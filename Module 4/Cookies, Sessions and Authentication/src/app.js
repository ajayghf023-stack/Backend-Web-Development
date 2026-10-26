require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { cookieSecret } = require('./session/cookieConfig');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cookieParser(cookieSecret));
app.use('/auth', authRoutes);
app.use((error, req, res, next) => {
  console.error(error.message);
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'A valid JSON body is required' },
    });
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on ${port}`));
