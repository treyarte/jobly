const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');

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

  /**
   *  Returns a specific company
   * - Output: {company: {companyData}}
   */
  static async get(handle) {
    const results = await db.query(
      `SELECT handle, name, num_employees, description, logo_url
        FROM companies WHERE handle = $1`,
      [handle]
    );

    let company = {};

    if (results.rows[0]) company = results.rows[0];
    else throw new ExpressError('Company Not Found', 404);

    return { company };
  }

  /**
   * accepts an object of values and creates a new company and returns that company
   * - Output: {Company: {companyData}}
   */
  static async create({ handle, name, num_employees, description, logo_url }) {
    const results = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) 
          VALUES ($1, $2, $3, $4, $5)  
          RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );

    if (results.rows[0]) {
      return { company: results.rows[0] };
    }
  }

  /**
   * accepts columns of values, updates a specified company and returns that updated company
   * - Input: {column: value}, handle
   * - Output: {Company: {companyData}}
   */
  static async update(columnsToBeUpdated, handle) {
    const updateQuery = sqlForPartialUpdate(
      'companies',
      columnsToBeUpdated,
      'handle',
      handle
    );

    const results = await db.query(updateQuery.query, updateQuery.values);

    return { Company: results.rows[0] };
  }

  /**
   * Deletes the specified company by its handle and return a delete message
   * - Input: handle
   * - Output: {message: "Company Deleted"}
   */
  static async delete(handle) {
    const company = Company.get(handle);

    await db.query('DELETE FROM companies WHERE handle = $1', [handle]);

    return { message: 'Company Deleted' };
  }
}

module.exports = Company;
