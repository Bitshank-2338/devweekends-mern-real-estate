require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

async function start() {
  // Fail fast with a clear message instead of crashing later on the first request.
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  try {
    await connectDB();
  } catch (error) {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`EstateNest API listening on port ${PORT}`);
  });
}

start();
