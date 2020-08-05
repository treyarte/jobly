const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require('../config');
const ExpressError = require('../helpers/expressError');

class User {
  static async register({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url = null,
  }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, email, photo_url)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING username, password, first_name, last_name, email, photo_url`,
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );

    return { user: results.rows[0] };
  }

  static async getAll() {
    const results = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    );

    return { users: results.rows };
  }

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
}

module.exports = User;
