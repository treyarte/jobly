const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const jobNewSchema = require('../jsonSchemas/jobNewSchema.json');
const jobUpdateSchema = require('../jsonSchemas/jobUpdateSchema.json');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const { validateJson } = require('../middleware/ajv_validator');

router.get('/', ensureLoggedIn, async (req, res, next) => {
  try {
    let { search, min_salary, min_equity } = req.query;

    min_salary = Number.parseInt(min_salary);
    min_equity = Number.parseFloat(min_equity);

    const jobs = await Job.getAll({ search, min_salary, min_equity });

    return res.json(jobs);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.get(id);

    return res.json(job);
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/',
  ensureLoggedIn,
  ensureAdmin,
  validateJson(jobNewSchema),
  async (req, res, next) => {
    try {
      const data = ({ title, salary, equity, company_handle } = req.body);
      const newJob = await Job.create(data);

      return res.status(201).json(newJob.job);
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  '/:id',
  ensureLoggedIn,
  ensureAdmin,
  validateJson(jobUpdateSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      //hide the token so it doesn't get set as a column in the update query
      Object.defineProperty(data, 'token', {
        enumerable: false,
      });

      const updatedJob = await Job.update(data, id);

      return res.json(updatedJob);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete('/:id', ensureLoggedIn, ensureAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const delMsg = await Job.delete(id);

    return res.json(delMsg);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
