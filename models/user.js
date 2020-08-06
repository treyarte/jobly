const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');
const ExpressError = require('../helpers/expressError');
const sqlPartialUpdate = require('../helpers/partialUpdate');

/**
 * Creates a new user and hash their password
 * returns: User Object
 */
class User {
  static async register({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url = null,
  }) {
    await uniqueEmail(email);
    await uniqueUsername(username);

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING username, password, first_name, last_name, email, photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );

    return { user: results.rows[0] };
  }

  /**
   * checks if the username/password is valid
   * returns: user object
   */
  static async authenticate(username, password) {
    const results = await db.query('SELECT *  FROM users WHERE username = $1', [
      username,
    ]);

    const user = results.rows[0];

    //check if the user exists
    if (user) {
      //compare the password to the password hash
      if (await bcrypt.compare(password, user.password)) {
        return user;
      }
    }
    throw new ExpressError('Invalid username/password combination', 400);
  }

  /**
   * retrieve all users
   * return: Users object: Array of users
   */
  static async getAll() {
    const results = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    );

    return { users: results.rows };
  }

  /**
   * returns a specific user
   *
   */
  static async get(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, email, photo_url FROM users WHERE username = $1`,
      [username]
    );

    if (results.rows.length === 0) {
      throw new ExpressError('User not found', 404);
    }

    return { user: results.rows[0] };
  }

  /**
   * Updates a specific user
   */
  static async update(updatedValues, username) {
    if (updatedValues.email) {
      uniqueEmail(uniqueEmail.email);
    }

    if (updatedValues.username) {
      uniqueUsername(updatedValues.username);
    }

    const { user } = await User.get(username);

    const updateQuery = sqlPartialUpdate(
      'users',
      updatedValues,
      'username',
      user.username
    );

    const results = await db.query(updateQuery.query, updateQuery.values);

    const updatedUser = results.rows[0];

    return {
      user: {
        username: updatedUser.username,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        photo_url: updatedUser.photo_url,
      },
    };
  }

  /**
   *
   * deletes a user
   */
  static async delete(username) {
    const { user } = await User.get(username);

    await db.query('DELETE FROM users WHERE username = $1', [user.username]);

    return { message: 'User deleted' };
  }
}

/**
 * Check if an email is already in use or not
 * throws an error if email is in use
 */
async function uniqueEmail(email) {
  const results = await db.query('SELECT email FROM users WHERE email = $1', [
    email,
  ]);

  if (results.rows.length !== 0) throw new ExpressError('Email is in use', 400);
}

async function uniqueUsername(username) {
  const results = await db.query(
    'SELECT username FROM users WHERE username = $1',
    [username]
  );

  if (results.rows.length !== 0)
    throw new ExpressError('Username is taken', 400);
}

module.exports = User;
