const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
class Job {
  static async getAll(criteria = null) {
    const baseQuery = `SELECT title, company_handle FROM jobs WHERE 1 = 1 `;
    const whereClause = [];
    const criteriaValues = [];

    if (criteria !== null) {
      if (criteria.search) {
        criteriaValues.push(`%${criteria.search}%`);
        whereClause.push(` AND title LIKE $${criteriaValues.length}`);
      }
      if (criteria.min_salary) {
        criteriaValues.push(criteria.min_salary);
        whereClause.push(` AND salary > $${criteriaValues.length}`);
      }
      if (criteria.min_equity) {
        criteriaValues.push(criteria.min_equity);
        whereClause.push(` AND equity > $${criteriaValues.length}`);
      }
    }
    const results = await db.query(
      baseQuery + whereClause.join(' '),
      criteriaValues
    );

    return { jobs: results.rows };
  }

  static async get(id) {
    const results = await db.query(
      'SELECT title, salary, equity, date_posted, company_handle FROM jobs WHERE id = $1',
      [id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError('job not found', 404);
    } else {
      const { company_handle } = results.rows[0];
      const { title, salary, equity, date_posted } = results.rows[0];

      let company = await db.query(
        'SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle = $1',
        [company_handle]
      );

      company = company.rows[0];

      return { title, salary, equity, date_posted, company };
    }
  }

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
