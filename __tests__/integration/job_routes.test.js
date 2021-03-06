const { NODE_ENV_TEST } = require('./jest.config.js');
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');

const {
  createTestCompanies,
  createTestJobs,
  createTestUsers,
} = require('./jest.config');

let c1, j1, j2, u1;

describe('Test routes for jobs', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM jobs');
    await db.query('DELETE FROM users');
    const testCompanies = await createTestCompanies();

    c1 = testCompanies[0].company;

    const testJobs = await createTestJobs(c1.handle);

    j1 = testJobs[0].job;
    j2 = testJobs[1].job;

    const users = await createTestUsers();
    u1 = users[0];

    resp = await request(app)
      .post(`/login`)
      .send({ username: u1.username, password: 'test' });
    const { token } = resp.body;
    u1.token = token;
  });

  describe('/GET jobs', () => {
    test('should return a list of jobs', async () => {
      const resp = await request(app).get('/jobs').send({ token: u1.token });

      expect(resp.body).toEqual({
        jobs: [
          { company_handle: j1.company_handle, title: j1.title },
          { company_handle: j2.company_handle, title: j2.title },
        ],
      });

      expect(resp.status).toEqual(200);
    });

    test('should return a list of jobs based of query string', async () => {
      let resp = await request(app)
        .get('/jobs?search=software')
        .send({ token: u1.token });

      expect(resp.body).toEqual({
        jobs: [{ company_handle: j1.company_handle, title: j1.title }],
      });

      resp = await request(app)
        .get('/jobs?min_salary=1000')
        .send({ token: u1.token });

      expect(resp.body).toEqual({
        jobs: [
          { company_handle: j1.company_handle, title: j1.title },
          { company_handle: j2.company_handle, title: j2.title },
        ],
      });

      resp = await request(app)
        .get('/jobs?min_equity=.4')
        .send({ token: u1.token });

      expect(resp.body).toEqual({
        jobs: [{ company_handle: j2.company_handle, title: j2.title }],
      });
    });
  });

  describe('/GET jobs/:id', () => {
    test('should get a specified job by its id', async () => {
      const resp = await request(app)
        .get(`/jobs/${j1.id}`)
        .send({ token: u1.token });

      expect(resp.body).toEqual({
        job: {
          id: j1.id,
          title: j1.title,
          salary: j1.salary,
          equity: j1.equity,
          date_posted: expect.any(String),
          company: c1,
        },
      });
      expect(resp.statusCode).toBe(200);
    });

    test('should return 404 for an invalid id', async () => {
      const resp = await request(app).get('/jobs/0').send({ token: u1.token });

      expect(resp.statusCode).toBe(404);
    });
  });

  describe('/POST jobs', () => {
    test('should create and return a new job', async () => {
      const jobValues = {
        title: 'QA',
        salary: 50000,
        equity: 0.2,
        company_handle: c1.handle,
      };
      const resp = await request(app)
        .post('/jobs')
        .send({ token: u1.token })
        .send(jobValues);

      expect(resp.body).toEqual({
        id: expect.any(Number),
        title: jobValues.title,
        salary: jobValues.salary,
        equity: jobValues.equity,
        date_posted: expect.any(String),
        company_handle: c1.handle,
      });
      expect(resp.statusCode).toBe(201);
    });
  });

  describe('/PATCH jobs', () => {
    test('should update a job at the specified columns', async () => {
      const updateValues = {
        title: 'fullstack engineer',
        salary: 80000,
      };

      const resp = await request(app)
        .patch(`/jobs/${j1.id}`)
        .send({ token: u1.token })
        .send(updateValues);

      j1.title = updateValues.title;
      j1.salary = updateValues.salary;

      expect(resp.body).toEqual({
        job: {
          id: expect.any(Number),
          title: j1.title,
          salary: j1.salary,
          equity: j1.equity,
          date_posted: expect.any(String),
          company_handle: c1.handle,
        },
      });
      expect(resp.statusCode).toBe(200);
    });

    // test('should return 404 if cannot find id', async () => {
    //   const resp = await request(app).patch('/jobs/0');

    //   expect(resp.statusCode).toBe(404);
    // });
  });

  describe('/DELETE jobs', () => {
    test('should delete and return a message', async () => {
      const resp = await request(app)
        .delete(`/jobs/${j1.id}`)
        .send({ token: u1.token });

      expect(resp.body).toEqual({ message: 'Job deleted' });
      expect(resp.statusCode).toBe(200);
    });
  });
});

afterAll(async () => {
  await db.end();
});
