require('dotenv').config();

const NODE_ENV_TEST = (process.env.NODE_ENV = 'test');

const db = require('../../db');
const Company = require('../../models/company');

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

async function createTestJobs() {
  // let j1, j2;
  // j1 = await
}

module.exports = { NODE_ENV_TEST, createTestCompanies };
