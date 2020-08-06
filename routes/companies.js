const express = require('express');
const router = express.Router();
const Company = require('../models/company');
const companySchema = require('../jsonSchemas/companySchema.json');
const companyUpdateSchema = require('../jsonSchemas/companyUpdateSchema.json');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const { validateJson } = require('../middleware/ajv_validator');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    let { search, min_employees, max_employees } = req.query;
    min_employees = Number.parseInt(min_employees);
    max_employees = Number.parseInt(max_employees);
    const companies = await Company.getAll({
      search,
      min_employees,
      max_employees,
    });

    return res.json(companies);
  } catch (error) {
    return next(error);
  }
});

router.get('/:handle', ensureLoggedIn, async (req, res, next) => {
  try {
    const { handle } = req.params;

    const company = await Company.get(handle);

    return res.json(company);
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/',
  ensureLoggedIn,
  ensureAdmin,
  validateJson(companySchema),
  async (req, res, next) => {
    try {
      const data = ({
        handle,
        name,
        num_employees,
        description,
        logo_url,
      } = req.body);

      const company = await Company.create(data);

      return res.status(201).json(company);
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  '/:handle',
  ensureLoggedIn,
  ensureAdmin,
  validateJson(companyUpdateSchema),
  async (req, res, next) => {
    try {
      const updateValues = req.body;

      //hide the token so it doesn't get set as a column in the update query
      Object.defineProperty(updateValues, 'token', {
        enumerable: false,
      });

      const { handle } = req.params;

      const company = await Company.update(updateValues, handle);

      return res.json(company);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete(
  '/:handle',
  ensureLoggedIn,
  ensureAdmin,
  async (req, res, next) => {
    try {
      const { handle } = req.params;

      const message = await Company.delete(handle);

      return res.json(message);
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
