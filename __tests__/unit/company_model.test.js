const { NODE_ENV_TEST } = require('./jest.config.js');
const db = require('../../db');
const Company = require('../../models/company');

let c1, c2;

describe('Test Company class', () => {
  beforeEach(async () => {
    db.query('DELETE FROM companies');

    c1 = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) 
        VALUES ('sun', 'sunoco', 1000, 'test', 'http://default.jpg')  
        RETURNING handle, name, num_employees, description, logo_url`
    );
    c1 = c1.rows[0];

    c2 = await db.query(
      `INSERT INTO companies (handle, name, num_employees, description, logo_url) 
      VALUES ('test', 'test company', 500, 'test', 'http://default.jpg')
      RETURNING handle, name, num_employees, description, logo_url`
    );

    c2 = c2.rows[0];
  });

  describe('getAll method test', () => {
    test('should return an object of with company data', async () => {
      const companies = await Company.getAll();
      expect(companies).toEqual({
        companies: [
          { handle: c1.handle, name: c1.name },
          { handle: c2.handle, name: c2.name },
        ],
      });
    });

    test('should return an object containing company data based on the search criteria', async () => {
      const companies = await Company.getAll({ search: 'su' });
      expect(companies).toEqual({
        companies: [{ handle: c1.handle, name: c1.name }],
      });
    });

    test('should return an object containing company data based on the min_employees criteria', async () => {
      const companies = await Company.getAll({ min_employees: 900 });
      expect(companies).toEqual({
        companies: [{ handle: c1.handle, name: c1.name }],
      });
    });

    test('should return an object containing company data based on the max_employees criteria', async () => {
      const companies = await Company.getAll({ max_employees: 600 });
      expect(companies).toEqual({
        companies: [{ handle: c2.handle, name: c2.name }],
      });
    });

    test('should return an error when min employees is greater than max', async () => {
      try {
        const companies = await Company.getAll({
          min_employees: 1000,
          max_employees: 500,
        });
      } catch (error) {
        expect(error.message).toEqual(
          'The minimum # of employees cannot be greater than the max'
        );
        expect(error.status).toBe(400);
      }
    });

    test('should return object company data with all criteria used', async () => {
      const companies = await Company.getAll({
        search: 'sun',
        min_employees: 900,
        max_employees: 1100,
      });
      expect(companies).toEqual({
        companies: [{ handle: c1.handle, name: c1.name }],
      });
    });
  });
});

afterAll(async () => {
  await db.end();
});
