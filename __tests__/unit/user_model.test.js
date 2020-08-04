const { NODE_ENV_TEST } = require('./jest.config.js');
const db = require('../../db');
const User = require('../../models/user');

let u1, u2;

describe('Test for the user model', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users');

    u1 = User.register({});
  });

  test('should register a new user', async () => {
    const user = await User.register({
      username: 'test user',
      password: 'test',
      first_name: 'Daigo',
      last_name: 'umehara',
      email: 'test@user.com',
      photo_url: 'http://sometestimage.com',
    });

    expect(user).toEqual({
      username: 'test user',
      password: expect.any(String),
      first_name: 'Daigo',
      last_name: 'umehara',
      email: 'test@user.com',
      photo_url: 'http://sometestimage.com',
    });
  });
});

afterAll(async () => {
  await db.end();
});
