require('dotenv').config();

const NODE_ENV_TEST = (process.env.NODE_ENV = 'test');

/**
 * Show or hide properties on an object
 * @param {*} propArr and array of properties
 * @param {*} bool true to show the property, false to hide it
 *
 */
function showOrHideProperties(obj, propArr, bool) {
  for (let p of propArr) {
    Object.defineProperty(obj, p, {
      enumerable: bool,
    });
  }
}

module.exports = { NODE_ENV_TEST, showOrHideProperties };
