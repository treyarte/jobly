const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
class Job {
  static async create({ title, salary, equity, company_handle }) {
    const results = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle) 
        VALUES ($1, $2, $3, $4) RETURNING title, salary, equity, date_posted, company_handle`,
      [title, salary, equity, company_handle]
    );

    return results.rows[0];
  }
}

module.exports = Job;
