import { todayInputValue } from './format';

// Visits that are still going to happen: today or later, and not cancelled/completed.
export function getUpcomingAppointments(appointments) {
  const today = todayInputValue();

  return appointments.filter(
    (appointment) =>
      appointment.date.slice(0, 10) >= today &&
      (appointment.status === 'requested' || appointment.status === 'confirmed')
  );
}
