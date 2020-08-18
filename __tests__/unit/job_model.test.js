const { NODE_ENV_TEST } = require('./jest.config.js');
const db = require('../../db');
const {
  createTestCompanies,
  createTestJobs,
} = require('../integration/jest.config');
const Job = require('../../models/job');

let j1, j2, c1;

describe('Tests for Job model', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM companies');

    const testCompanies = await createTestCompanies();

    c1 = testCompanies[0].company;

    const testJobs = await createTestJobs(c1.handle);

    j1 = testJobs[0].job;
    j2 = testJobs[1].job;
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
    console.log(j1);
    const job = await Job.get(j1.id);

    expect(job).toEqual({
      job: {
        id: j1.id,
        title: j1.title,
        salary: j1.salary,
        equity: j1.equity,
        date_posted: expect.any(Date),
        company: c1,
      },
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
      job: {
        id: expect.any(Number),
        title: jobValues.title,
        salary: jobValues.salary,
        equity: jobValues.equity,
        date_posted: expect.any(Date),
        company_handle: c1.handle,
      },
    });
  });

  test('should update a specified job only at the given columns', async () => {
    const updatedValues = {
      salary: 80000,
      equity: 0.7,
    };
    (j1.salary = 80000), (j1.equity = 0.7);
    const updatedJob = await Job.update(updatedValues, j1.id);

    expect(updatedJob).toEqual({
      job: j1,
    });
  });

  test('should delete a job', async () => {
    try {
      const deleteMessage = await Job.delete(j1.id);

      expect(deleteMessage).toEqual({ message: 'Job deleted' });

      await Job.get(j1.id);
    } catch (error) {
      expect(error.message).toEqual('job not found');
    }
  });

  test('should throw an error if job id is invalid', async () => {
    try {
      await Job.get(0);
    } catch (error) {
      expect(error.message).toEqual('job not found');
    }
  });
});

afterAll(async () => {
  db.end();
});
