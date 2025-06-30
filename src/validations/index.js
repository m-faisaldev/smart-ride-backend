const { fields, schemas } = require('./common');
const routeSchemas = require('./schemas');

module.exports = {
  fields,
  schemas,
  routes: routeSchemas,
};
