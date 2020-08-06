const { NODE_ENV_TEST } = require('./jest.config.js');
const request = require('supertest');
const app = require('../../app');
const db = require('../../db');
const jwt = require('jsonwebtoken');
const { createTestUsers } = require('./jest.config');
const { showOrHideProperties } = require('../unit/jest.config');
const User = require('../../models/user');

let u1, u2;
describe('User test routes', () => {
  beforeEach(async () => {
    db.query('DELETE FROM users');
    const users = await createTestUsers();
    u1 = users[0];
    u2 = users[1];
  });

  describe('/GET users', () => {
    test('should get a list of users', async () => {
      const resp = await request(app).get('/users');

      showOrHideProperties(u1, ['photo_url', 'password', 'is_admin'], false);
      showOrHideProperties(u2, ['photo_url', 'password', 'is_admin'], false);

      expect(resp.body).toEqual({ users: [u1, u2] });
      expect(resp.statusCode).toBe(200);
    });
  });

  describe('/GET users/:username', () => {
    test('should get a specific user based on their username', async () => {
      const resp = await request(app).get(`/users/${u1.username}`);

      showOrHideProperties(u1, ['photo_url'], true);
      showOrHideProperties(u1, ['password', 'is_admin'], false);

      expect(resp.body).toEqual({ user: u1 });
      expect(resp.statusCode).toBe(200);
    });
  });

  describe('/POST users', () => {
    test('should  create and return a user', async () => {
      const newUser = {
        username: 'pTestUser',
        first_name: 'person',
        last_name: 'test',
        email: 'ptest@user.com',
        photo_url: 'http://test.com',
        password: 'test',
      };
      const resp = await request(app).post('/users').send(newUser);
      const { token } = resp.body;

      expect(jwt.decode(token)).toEqual({
        username: 'pTestUser',
        is_admin: false,
        iat: expect.any(Number),
      });
      expect(resp.statusCode).toBe(201);
    });
  });

  describe('/PATCH users/:username', () => {
    test('should update a specific user', async () => {
      const updatedValues = {
        username: 'updateuser',
        first_name: 'roy',
      };

      const resp = await request(app)
        .patch(`/users/${u1.username}`)
        .send(updatedValues);

      showOrHideProperties(u1, ['password'], false);

      const updatedUser = await User.get(updatedValues.username);

      expect(resp.body).toEqual(updatedUser);
      expect(resp.statusCode).toBe(200);
    });
  });

  describe('/DELETE users/:username', () => {
    test('should delete a user and return a message', async () => {
      const resp = await request(app).delete(`/users/${u1.username}`);

      expect(resp.body).toEqual({ message: 'User deleted' });
      expect(resp.statusCode).toBe(200);
    });
  });
});

afterAll(async () => {
  db.end();
});
