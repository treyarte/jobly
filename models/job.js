const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
class Job {
  /**
   * Get a list of jobs based on the criteria specified.
   * returns: Jobs object: array of jobs
   */
  static async getAll(criteria = null) {
    const baseQuery = `SELECT title, company_handle FROM jobs WHERE 1 = 1 `;
    const whereClause = [];
    const criteriaValues = [];

    if (criteria !== null) {
      if (criteria.search) {
        criteriaValues.push(`%${criteria.search}%`);
        //adds a parameterized query on to the where clause.
        //The length specifies where search will be at in the values array in db.query
        whereClause.push(` AND title LIKE $${criteriaValues.length}`);
      }
      if (criteria.min_salary) {
        criteriaValues.push(criteria.min_salary);
        whereClause.push(` AND salary > $${criteriaValues.length}`);
      }
      if (criteria.min_equity) {
        if (criteria.min_equity > 1)
          throw new ExpressError('min_equity must be between 0 and 1');
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

  /**
   * Gets a specific job based on its id
   * return: job object
   */
  static async get(id) {
    const results = await db.query(
      'SELECT id, title, salary, equity, date_posted, company_handle FROM jobs WHERE id = $1',
      [id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError('job not found', 404);
    } else {
      const { company_handle } = results.rows[0];
      const { id, title, salary, equity, date_posted } = results.rows[0];

      let company = await db.query(
        'SELECT handle, name, num_employees, description, logo_url FROM companies WHERE handle = $1',
        [company_handle]
      );

      company = company.rows[0];

      return { job: { id, title, salary, equity, date_posted, company } };
    }
  }

  /**
   * creates and return a new job
   *
   */

  static async create({ title, salary, equity, company_handle }) {
    const results = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle) 
        VALUES ($1, $2, $3, $4) RETURNING id, title, salary, equity, date_posted, company_handle`,
      [title, salary, equity, company_handle]
    );

    return { job: results.rows[0] };
  }

  /**
   * updates a specified job
   */
  static async update(valuesObj, id) {
    const { job } = await Job.get(id);

    const updateObj = sqlForPartialUpdate('jobs', valuesObj, 'id', job.id);

    const results = await db.query(updateObj.query, updateObj.values);

    return { job: results.rows[0] };
  }

  /**
   *
   * deletes a job based on its id
   * returns: object with a message property
   */
  static async delete(id) {
    const { job } = await Job.get(id);

    await db.query('DELETE FROM jobs WHERE id = $1', [job.id]);

    return { message: 'Job deleted' };
  }
}

module.exports = Job;
