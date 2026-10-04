const httpError = require('../utils/httpError');

// Runs after protect. Usage: authorize('agent') lets only agents through.
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(httpError(403, `Only ${roles.join(' or ')} accounts can do this`));
    }
    next();
  };
}

module.exports = authorize;
