const { NODE_ENV_TEST } = require('./jest.config.js');
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const Company = require('../../models/company');
const { createTestCompanies } = require('./jest.config');

let c1, c2;

describe('Test Routes for companies', () => {
  beforeEach(async () => {
    db.query('DELETE FROM companies');

    const testCompanies = await createTestCompanies();

    c1 = testCompanies[0].company;

    c2 = testCompanies[1].company;
  });

  describe('/GET companies', () => {
    test('should get a list of users and a status 200', async () => {
      const resp = await request(app).get('/companies');

      expect(resp.body).toEqual({
        companies: [
          { handle: c1.handle, name: c1.name },
          { handle: c2.handle, name: c2.name },
        ],
      });
      expect(resp.statusCode).toBe(200);
    });

    test('should return a list of users with the specified criteria', async () => {
      const resp = await request(app).get(
        '/companies?search=su&min_employees=600&max_employees=1100'
      );

      expect(resp.body).toEqual({
        companies: [{ handle: c1.handle, name: c1.name }],
      });
    });
  });

  describe('/GET/:handle companies', () => {
    test('should return  a specific company', async () => {
      const resp = await request(app).get(`/companies/${c1.handle}`);

      expect(resp.body).toEqual({ company: c1 });
      expect(resp.statusCode).toBe(200);
    });
    test('should return 404 for handle that does not exist', async () => {
      const resp = await request(app).get(`/companies/noexist`);
      expect(resp.statusCode).toBe(404);
    });
  });
});

describe('/POST companies', () => {
  test('should create and return a new post', async () => {
    const newCompanyValues = {
      handle: 'bush',
      name: 'bushido road',
      num_employees: 5000,
      description: 'some company',
      logo_url: 'http://some-test-url.com',
    };
    const resp = await request(app).post('/companies').send(newCompanyValues);

    expect(resp.body).toEqual({ company: newCompanyValues });
    expect(resp.statusCode).toBe(201);
  });
});

describe('/PATCH companies', () => {
  test('should update a specified company ', async () => {
    const resp = await request(app)
      .patch(`/companies/${c1.handle}`)
      .send({ name: 'updated company', num_employees: 200 });

    expect(resp.body).toEqual({
      Company: {
        handle: c1.handle,
        name: 'updated company',
        num_employees: 200,
        description: c1.description,
        logo_url: c1.logo_url,
      },
    });

    expect(resp.statusCode).toBe(200);
  });
});

describe('/DELETE companies', () => {
  test('should delete a company and return a message', async () => {
    const resp = await request(app).delete(`/companies/${c1.handle}`);

    expect(resp.body).toEqual({ message: 'Company Deleted' });
    expect(resp.statusCode).toBe(200);
  });
});

afterAll(async () => {
  db.end();
});
