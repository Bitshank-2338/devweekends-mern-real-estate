// Creates an Error that the error middleware turns into a response
// with the given status code, e.g. throw httpError(404, 'Property not found').
function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = httpError;
