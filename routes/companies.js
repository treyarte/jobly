const express = require('express');
const router = express.Router();
const ExpressError = require('../helpers/expressError');
const Company = require('../models/company');
const companySchema = require('../jsonSchemas/companySchema.json');
const companyUpdateSchema = require('../jsonSchemas/companyUpdateSchema.json');
const { validateJson } = require('../middlewares/ajv_validator');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

router.get('/', async (req, res, next) => {
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

router.get('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;

    const company = await Company.get(handle);

    return res.json(company);
  } catch (error) {
    return next(error);
  }
});

router.post('/', validateJson(companySchema), async (req, res, next) => {
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
});

router.patch(
  '/:handle',
  validateJson(companyUpdateSchema),
  async (req, res, next) => {
    try {
      const updateValues = req.body;
      const { handle } = req.params;

      const company = await Company.update(updateValues, handle);

      return res.json(company);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete('/:handle', async (req, res, next) => {
  try {
    const { handle } = req.params;

    const message = await Company.delete(handle);

    return res.json(message);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
