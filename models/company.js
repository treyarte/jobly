const db = require('../db');
const ExpressError = require('../helpers/expressError');

class Company {
  constructor(handle, name, num_employees, description, logo_url) {
    this.handle = handle;
    this.name = name;
    this.num_employees = num_employees;
    this.description = description;
    this.logo_url = logo_url;
  }

  /**
   *  Returns a list of company objects
   * - criteria:  key value pair with Specific conditions on the search
   */
  static async getAll(criteria = null) {
    //makes it easier to chain on other where conditions. There is debate on if 1 = 1 causes
    // performance issues. More info here https://dba.stackexchange.com/questions/33937/good-bad-or-indifferent-where-1-1
    const baseQuery = `SELECT handle, name FROM companies WHERE 1 = 1 `;
    const whereClause = [];
    const criteriaValues = [];

    if (criteria !== null) {
      if (criteria.min_employees > criteria.max_employees) {
        throw new ExpressError(
          'The minimum # of employees cannot be greater than the max',
          400
        );
      }

      if (criteria.search) {
        criteriaValues.push(`%${criteria.search}%`);
        whereClause.push(` AND name LIKE $${criteriaValues.length}`);
      }
      if (criteria.min_employees) {
        criteriaValues.push(criteria.min_employees);
        whereClause.push(` AND num_employees > $${criteriaValues.length}`);
      }
      if (criteria.max_employees) {
        criteriaValues.push(criteria.max_employees);
        whereClause.push(` AND num_employees < $${criteriaValues.length}`);
      }
    }

    const results = await db.query(
      baseQuery + whereClause.join(' '),
      criteriaValues
    );

    return { companies: results.rows };
  }
}

module.exports = Company;
