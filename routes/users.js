const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', async (req, res, next) => {
  try {
    const users = await User.getAll();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
});

router.get('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await User.get(username);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    const user = await User.register(data);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;
    const updateData = req.body;

    const user = await User.update(updateData, username);

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    const message = await User.delete(username);

    return res.json(message);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
