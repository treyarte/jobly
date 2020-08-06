const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');
const ExpressError = require('../helpers/expressError');

/**
 * login a user and sign a token
 */

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.authenticate(username, password);

    const token = jwt.sign(
      { username: user.username, is_admin: user.is_admin },
      SECRET_KEY
    );

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
