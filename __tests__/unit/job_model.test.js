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
        VALUES ($1, $2, $3, $4) RETURNING id, title, salary, equity, company_handle, date_posted`,
      ['software engineer', 60000, 0.4, c1.handle]
    );

    j1 = j1.rows[0];

    j2 = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ($1, $2, $3, $4) RETURNING id, title, salary, equity, company_handle, date_posted`,
      ['Stocker', 20800, 0.5, c1.handle]
    );

    j2 = j2.rows[0];
  });

  test('should return a list of jobs', async () => {
    let jobs = await Job.getAll();
    expect(jobs).toEqual({
      jobs: [
        { company_handle: j1.company_handle, title: j1.title },
        { company_handle: j2.company_handle, title: j2.title },
      ],
    });

    jobs = await Job.getAll({ search: 'software' });
    expect(jobs).toEqual({
      jobs: [{ company_handle: j1.company_handle, title: j1.title }],
    });

    jobs = await Job.getAll({ min_salary: 20000 });
    expect(jobs).toEqual({
      jobs: [
        { company_handle: j1.company_handle, title: j1.title },
        { company_handle: j2.company_handle, title: j2.title },
      ],
    });

    jobs = await Job.getAll({ min_equity: 0.4 });
    expect(jobs).toEqual({
      jobs: [{ company_handle: j2.company_handle, title: j2.title }],
    });
  });

  test('should return a job with a company object', async () => {
    const job = await Job.get(j1.id);

    expect(job).toEqual({
      title: j1.title,
      salary: j1.salary,
      equity: j1.equity,
      date_posted: expect.any(Date),
      company: c1,
    });
  });

  test('should return an error when an invalid id is get', async () => {
    try {
      const job = await Job.get(0);
    } catch (error) {
      expect({ message: error.message, status: error.status }).toEqual({
        message: 'job not found',
        status: 404,
      });
    }
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
