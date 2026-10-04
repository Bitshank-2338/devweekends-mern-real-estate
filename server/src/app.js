const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const notFound = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// The React app lives on another origin (another port locally, another domain
// in production). CLIENT_URL lists the origins allowed to call this API.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check, handy after deploying to confirm the API is awake.
app.get('/', (req, res) => {
  res.json({ message: 'EstateNest API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
