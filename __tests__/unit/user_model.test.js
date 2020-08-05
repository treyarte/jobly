const { NODE_ENV_TEST, showOrHideProperties } = require('./jest.config.js');
const db = require('../../db');
const User = require('../../models/user');
const { createTestUsers } = require('../integration/jest.config');

let u1, u2;

describe('Test for the user model', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users');
    const users = await createTestUsers();
    u1 = users[0];
    u2 = users[1];
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
      user: {
        username: 'test user',
        password: expect.any(String),
        first_name: 'Daigo',
        last_name: 'umehara',
        email: 'test@user.com',
        photo_url: 'http://sometestimage.com',
      },
    });
  });

  test('should return a list of users', async () => {
    const users = await User.getAll();
    //hiding password and photo url properties
    showOrHideProperties(u1, ['password', 'photo_url'], false);
    showOrHideProperties(u2, ['password', 'photo_url'], false);

    expect(users).toEqual({ users: [u1, u2] });
  });
});

test('should return a specified user', async () => {
  showOrHideProperties(u1, ['photo_url'], true);

  const user = await User.get(u1.username);
  expect(user).toEqual({ user: u1 });
});

describe('', () => {});

afterAll(async () => {
  await db.end();
});
