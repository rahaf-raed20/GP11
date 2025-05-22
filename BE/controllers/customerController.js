const pool = require('../config/db');

const customerController = {
  // Get customer's bookings with hall and companies
  getBookings: async (req, res) => {
    try {
      const customerId = req.user.id;
      
      // Get hall bookings
      const [hallBookings] = await pool.query(`
        SELECT 
          b.id,
          h.name as hall_name,
          b.event_date,
          b.event_start_time,
          b.event_end_time,
          b.total_hall_price,
          b.approval,
          b.created_at
        FROM booking b
        JOIN halls h ON b.halls_id = h.id
        WHERE b.customer_id = ?
        ORDER BY b.event_date DESC
      `, [customerId]);
      
      // Get company bookings for each hall booking
      for (let booking of hallBookings) {
        const [companies] = await pool.query(`
          SELECT 
            cb.id,
            tpc.name as company_name,
            tpc.category_id,
            tc.type as category_name,
            cb.start_time,
            cb.end_time,
            cb.price
          FROM company_booking cb
          JOIN third_party_company tpc ON cb.company_id = tpc.id
          JOIN third_category tc ON tpc.category_id = tc.id
          WHERE cb.booking_id = ?
        `, [booking.id]);
        
        booking.companies = companies;
      }
      
      res.status(200).json({ success: true, data: hallBookings });
    } catch (error) {
      console.error('Error getting bookings:', error);
      res.status(500).json({ success: false, message: 'Failed to get bookings' });
    }
  },

  // Update a booking (only certain fields)
  updateBooking: async (req, res) => {
    try {
      const customerId = req.user.id;
      const bookingId = req.params.id;
      const { event_date, event_start_time, event_end_time } = req.body;
      
      // Verify booking belongs to customer
      const [booking] = await pool.query(
        'SELECT id FROM booking WHERE id = ? AND customer_id = ?',
        [bookingId, customerId]
      );
      
      if (!booking.length) {
        return res.status(403).json({ 
          success: false, 
          message: 'Booking not found or access denied' 
        });
      }
      
      // Only allow updating future bookings that are not approved yet
      const currentDate = new Date().toISOString().split('T')[0];
      
      if (event_date && event_date < currentDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot update past bookings' 
        });
      }
      
      // Build update query
      const updates = {};
      if (event_date) updates.event_date = event_date;
      if (event_start_time) updates.event_start_time = event_start_time;
      if (event_end_time) updates.event_end_time = event_end_time;
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No valid fields to update' 
        });
      }
      
      // Update booking
      await pool.query(
        'UPDATE booking SET ? WHERE id = ?',
        [updates, bookingId]
      );
      
      res.status(200).json({ success: true, message: 'Booking updated' });
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({ success: false, message: 'Failed to update booking' });
    }
  },

  // Get customer profile
  getProfile: async (req, res) => {
    try {
      const customerId = req.user.id;
      
      const [profile] = await pool.query(`
        SELECT 
          u.id,
          u.fname,
          u.mname,
          u.lname,
          u.email,
          c.name as city,
          u.image_url
        FROM user u
        JOIN city c ON u.city_id = c.id
        WHERE u.id = ?
      `, [customerId]);
      
      if (!profile.length) {
        return res.status(404).json({ 
          success: false, 
          message: 'Profile not found' 
        });
      }
      
      res.status(200).json({ success: true, data: profile[0] });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
  },

  // Update customer profile
  updateProfile: async (req, res) => {
    try {
      const customerId = req.user.id;
      const { fname, mname, lname, email, city_id, image_url } = req.body;
      
      // Build update object
      const updates = {};
      if (fname) updates.fname = fname;
      if (mname) updates.mname = mname;
      if (lname) updates.lname = lname;
      if (email) updates.email = email;
      if (city_id) updates.city_id = city_id;
      if (image_url) updates.image_url = image_url;
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No valid fields to update' 
        });
      }
      
      // Check if email already exists
      if (email) {
        const [existing] = await pool.query(
          'SELECT id FROM user WHERE email = ? AND id != ?',
          [email, customerId]
        );
        
        if (existing.length) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already in use' 
          });
        }
      }
      
      // Update profile
      await pool.query(
        'UPDATE user SET ? WHERE id = ?',
        [updates, customerId]
      );
      
      res.status(200).json({ success: true, message: 'Profile updated' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
};

module.exports = customerController;