// The one place where errors become responses. Express 5 also sends errors
// thrown inside async controllers here, so controllers need no try/catch.
// Express recognises an error handler by its four arguments, so `next` stays.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // A schema rule failed. Report the first message so the UI can show it.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)[0].message;
  }

  // Mongoose could not cast a value, typically a malformed ObjectId.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path === '_id' ? 'id' : err.path}`;
  }

  // A unique index rejected the write.
  if (err.code === 11000) {
    statusCode = 409;
    message = err.keyPattern?.email ? 'Email is already registered' : 'This record already exists';
  }

  // express.json() could not parse the request body.
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body must be valid JSON';
  }

  if (statusCode === 500) {
    console.error(err);

    // Hide raw database/driver messages from users in production.
    if (process.env.NODE_ENV === 'production') {
      message = 'Something went wrong on the server';
    }
  }

  res.status(statusCode).json({
    message,
    // Stack traces help while developing but must never reach users.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = errorHandler;
