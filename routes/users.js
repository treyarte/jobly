const express = require('express');
const router = express.Router();
const User = require('../models/user');
const userSchema = require('../jsonSchemas/userSchema.json');
const userUpdateSchema = require('../jsonSchemas/userUpdateSchema.json');
const { validateJson } = require('../middleware/ajv_validator');

const jwt = require('jsonwebtoken');
const {
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUser,
} = require('../middleware/auth');
const { SECRET_KEY } = require('../config');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.get('/:username', ensureLoggedIn, async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.get(username);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.post('/', validateJson(userSchema), async (req, res, next) => {
  try {
    const data = req.body;
    const { user } = await User.register(data);

    const token = jwt.sign(
      {
        username: user.username,
        is_admin: user.is_admin,
      },
      SECRET_KEY
    );
    return res.status(201).json({ token });
  } catch (error) {
    return next(error);
  }
});

router.patch(
  '/:username',
  ensureLoggedIn,
  ensureCorrectUser,
  validateJson(userUpdateSchema),
  async (req, res, next) => {
    try {
      const { username } = req.params;
      const updateData = req.body;

      //hide the token so it doesn't get set as a column in the update query
      Object.defineProperty(updateData, 'token', {
        enumerable: false,
      });

      const user = await User.update(updateData, username);

      return res.json(user);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete(
  '/:username',
  ensureLoggedIn,
  ensureCorrectUser,
  async (req, res, next) => {
    try {
      const { username } = req.params;

      const message = await User.delete(username);

      return res.json(message);
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
