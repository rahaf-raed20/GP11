const pool = require('../config/db');

const validateBookingAvailability = async (hallId, date, startTime, endTime) => {
  try {
    // Check against existing bookings
    const [conflicts] = await pool.query(`
      SELECT id FROM booking 
      WHERE halls_id = ? 
      AND event_date = ?
      AND approval = 'approved'
      AND (
        (? < event_end_time AND ? > event_start_time)
      )
    `, [hallId, date, startTime, endTime]);
    
    if (conflicts.length > 0) {
      return false;
    }
    
    // Check against vacation days
    const [vacation] = await pool.query(
      'SELECT id FROM vacation_days WHERE Halls_id = ? AND date = ?',
      [hallId, date]
    );
    
    if (vacation.length > 0) {
      return false;
    }
    
    // Check hall operating hours
    const [hall] = await pool.query(
      'SELECT open_time, close_time FROM halls WHERE id = ?',
      [hallId]
    );
    
    if (hall.length === 0) {
      return false;
    }
    
    const openTime = new Date(`1970-01-01T${hall[0].open_time}`);
    const closeTime = new Date(`1970-01-01T${hall[0].close_time}`);
    const requestedStart = new Date(`1970-01-01T${startTime}`);
    const requestedEnd = new Date(`1970-01-01T${endTime}`);
    
    return requestedStart >= openTime && requestedEnd <= closeTime;
  } catch (error) {
    console.error('Availability check error:', error);
    return false;
  }
};

module.exports = { validateBookingAvailability };