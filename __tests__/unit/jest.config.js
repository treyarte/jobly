require('dotenv').config();

const NODE_ENV_TEST = (process.env.NODE_ENV = 'test');

module.exports = { NODE_ENV_TEST };
