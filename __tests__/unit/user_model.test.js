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
        is_admin: false,
      },
    });
  });

  // test('should throw an error for a non unique email', async () => {
  //   try {
  //     const user = await User.register({
  //       username: 'test user',
  //       password: 'test',
  //       first_name: 'Daigo',
  //       last_name: 'umehara',
  //       email: u1.email,
  //       photo_url: 'http://sometestimage.com',
  //     });
  //   } catch (error) {
  //     expect(error.message).toEqual('Email is in use');
  //   }
  // });

  test('should return a list of users', async () => {
    const users = await User.getAll();
    //hiding password and photo url properties
    showOrHideProperties(u1, ['password', 'photo_url', 'is_admin'], false);
    showOrHideProperties(u2, ['password', 'photo_url', 'is_admin'], false);

    expect(users).toEqual({ users: [u1, u2] });
  });
});

test('should return a specified user', async () => {
  showOrHideProperties(u1, ['photo_url'], true);

  const user = await User.get(u1.username);
  expect(user).toEqual({ user: u1 });
});

test('should return an error for an invalid username', async () => {
  try {
    await User.get('Username that is not real');
  } catch (error) {
    expect(error.message).toEqual('User not found');
    expect(error.status).toEqual(404);
  }
});

test('should update a specified user based on columns sent', async () => {
  const { user } = await User.update(
    { email: 'myNewUpdated@email.com', last_name: 'updatedLastName' },
    u1.username
  );

  expect(user.email).toEqual('myNewUpdated@email.com');
  expect(user.last_name).toEqual('updatedLastName');
});

// test('should return an error on update for a non unique email', async () => {
//   try {
//     await User.update({ email: u1.email }, u1.username);
//   } catch (error) {
//     expect(error.message).toEqual('Email is in use');
//   }
// });

test('should  deleted a specified user', async () => {
  try {
    const { message } = await User.delete(u1.username);

    expect(message).toEqual('User deleted');

    //expecting a not found error
    await User.get(u1.username);
  } catch (error) {
    expect(error.message).toEqual('User not found');
    expect(error.status).toEqual(404);
  }
});

afterAll(async () => {
  await db.end();
});
