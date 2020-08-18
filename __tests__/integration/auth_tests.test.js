const { NODE_ENV_TEST } = require('./jest.config.js');
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const { createTestUsers } = require('./jest.config');
const jwt = require('jsonwebtoken');

let u1, u2;
describe('Authentication test routes', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users');
    const users = await createTestUsers();
    u1 = users[0];
    u2 = users[1];
  });

  describe('/POST login', () => {
    test('should login a user', async () => {
      const resp = await request(app)
        .post('/login')
        .send({ username: 'sam', password: 'test' });
      const { token } = resp.body;

      expect(jwt.decode(token)).toEqual({
        username: 'sam',
        is_admin: true,
        iat: expect.any(Number),
      });
    });

    test('should return 400 error if invalid credentials', async () => {
      const resp = await request(app)
        .post('/login')
        .send({ username: 'notReal', password: 'no' });

      expect(resp.body).toEqual({
        status: 400,
        message: 'Invalid username/password combination',
      });
      expect(resp.status).toBe(400);
    });
  });
});

afterAll(async () => {
  db.end();
});
