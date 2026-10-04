const express = require('express');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

// Every appointment route needs a logged-in user.
router.use(protect);

router.post('/', authorize('buyer'), createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.delete('/:id', authorize('buyer'), deleteAppointment);

module.exports = router;
