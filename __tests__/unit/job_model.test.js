const { NODE_ENV_TEST } = require('./jest.config.js');
const db = require('../../db');
const { createTestCompanies } = require('../integration/jest.config');
const Job = require('../../models/job');

let j1, j2, c1;

describe('Tests for Job model', () => {
  beforeEach(async () => {
    db.query('DELETE FROM jobs');
    db.query('DELETE FROM companies');

    const testCompanies = await createTestCompanies();

    c1 = testCompanies[0].company;

    j1 = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4) RETURNING title, salary, equity, company_handle, date_posted`,
      ['software engineer', 60000, 0.4, c1.handle]
    );

    j1 = j1.rows[0];

    j2 = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4) RETURNING title, salary, equity, company_handle, date_posted`,
      ['Stocker', 20800, 0.5, c1.handle]
    );

    j2 = j2.rows[0];
  });

  test('should return a list of jobs', async () => {
    const jobs = await job.getAll();
    expect(jobs).toEqual([j1, j2]);
  });

  test('should create a new job', async () => {
    const jobValues = {
      title: 'test',
      salary: 100000,
      equity: 0.1,
      company_handle: c1.handle,
    };
    const job = await Job.create(jobValues);

    expect(job).toEqual({
      title: jobValues.title,
      salary: jobValues.salary,
      equity: jobValues.equity,
      date_posted: expect.any(Date),
      company_handle: c1.handle,
    });
  });
});

afterAll(async () => {
  db.end();
});
