const ExpressError = require('../helpers/expressError');
const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

function validateJson(schema) {
  return function (req, res, next) {
    try {
      const data = req.body;

      const valid = ajv.validate(schema, data);

      if (!valid) {
        let errors = ajv.errors.map((e) => e.message);
        throw new ExpressError(errors, 400);
      } else {
        return next();
      }
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = {
  validateJson,
};
