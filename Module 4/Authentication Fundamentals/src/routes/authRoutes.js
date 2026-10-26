const express = require('express');
const { login, register } = require('../services/authService');

const router = express.Router();

router.post('/register', (req, res, next) => {
  register(req.body)
    .then((user) => res.status(201).json(user))
    .catch(next);
});

router.post('/login', (req, res, next) => {
  login(req.body)
    .then((user) => res.status(200).json(user))
    .catch(next);
});

module.exports = router;
