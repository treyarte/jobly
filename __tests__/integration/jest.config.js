require('dotenv').config();

const NODE_ENV_TEST = (process.env.NODE_ENV = 'test');

const Company = require('../../models/company');
const Job = require('../../models/job');
const User = require('../../models/user');

async function createTestCompanies() {
  let c1, c2;
  c1 = await Company.create({
    handle: 'sun',
    name: 'sunoco',
    num_employees: 1000,
    description: 'test',
    logo_url: 'http://default.jpg',
  });

  c2 = await Company.create({
    handle: 'test',
    name: 'test company',
    num_employees: 500,
    description: 'test',
    logo_url: 'http://default.jpg',
  });

  return [c1, c2];
}

async function createTestJobs(company_handle) {
  let j1, j2;

  j1 = await Job.create({
    title: 'software engineer',
    salary: 60000,
    equity: 0.4,
    company_handle: company_handle,
  });

  j2 = await Job.create({
    title: 'test job',
    salary: 20800,
    equity: 0.5,
    company_handle: company_handle,
  });

  return [j1, j2];
}

async function createTestUsers() {
  let u1, u2;

  u1 = await User.register({
    username: 'sam',
    password: 'test',
    first_name: 'samuel',
    last_name: 'person',
    email: 'sam@user.com',
    photo_url: 'http://sometestimage.com',
  });

  u2 = await User.register({
    username: 'max',
    password: 'test',
    first_name: 'maximilian',
    last_name: 'dood',
    email: 'max@user.com',
    photo_url: 'http://sometestimage.com',
  });

  return [u1.user, u2.user];
}

module.exports = {
  NODE_ENV_TEST,
  createTestCompanies,
  createTestJobs,
  createTestUsers,
};
