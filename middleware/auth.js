/**Middleware for protecting routes */

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const ExpressError = require('../helpers/expressError');

/**check for a valid jwt token */
function authenticateJWT(req, res, next) {
  try {
    const { token } = req.body;
    const payload = jwt.verify(token, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (error) {
    return next();
  }
}
/**
 * check if a user is logged in
 */
function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    const error = new ExpressError('Unauthorized Access', 401);
    return next(error);
  } else {
    next();
  }
}

/**
 * check for correct user
 */
function ensureCorrectUser(req, res, next) {
  if (req.user.username === req.params.username) {
    return next();
  } else {
    const error = new ExpressError('Unauthorized Access', 401);
    return next(error);
  }
}

/**
 * Check if user is admin
 */
function ensureAdmin(req, res, next) {
  if (req.user.is_admin) {
    return next();
  } else {
    const error = new ExpressError('Unauthorized Access', 401);
    return next(error);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdmin,
};
