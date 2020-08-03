const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const jobNewSchema = require('../jsonSchemas/jobNewSchema.json');
const jobUpdateSchema = require('../jsonSchemas/jobUpdateSchema.json');
const { validateJson } = require('../middlewares/ajv_validator');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

router.get('/', async (req, res, next) => {
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

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.get(id);

    return res.json(job);
  } catch (error) {
    return next(error);
  }
});

router.post('/', validateJson(jobNewSchema), async (req, res, next) => {
  try {
    const data = ({ title, salary, equity, company_handle } = req.body);
    const newJob = await Job.create(data);

    return res.status(201).json(newJob.job);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', validateJson(jobUpdateSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedJob = await Job.update(data, id);

    return res.json(updatedJob);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const delMsg = await Job.delete(id);

    return res.json(delMsg);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
