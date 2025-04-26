// controllers/bookingController.js
const pool = require('../config/db');

const bookingController = {
    // Owner creates a booking for a customer
    createBooking: async (req, res) => {
        try {
            const ownerId = req.user.id; // Owner's user ID from JWT
            const { hallId, customerEmail, eventDate, startTime, endTime } = req.body;

            // Validate required fields
            if (!hallId || !customerEmail || !eventDate || !startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Hall ID, customer email, date, start/end time are required'
                });
            }

            // 1. Verify the hall belongs to the owner
            const [hall] = await pool.query(
                'SELECT * FROM halls WHERE id = ? AND owner_id = (SELECT id FROM owner WHERE user_id = ?)',
                [hallId, ownerId]
            );
            if (!hall.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Hall not found or you do not own this hall'
                });
            }

            // 2. Get customer ID from email
            const [customer] = await pool.query(
                'SELECT c.id FROM customer c JOIN user u ON c.user_id = u.id WHERE u.email = ?',
                [customerEmail]
            );
            if (!customer.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            // 3. Check for date/time conflicts
            const [conflicts] = await pool.query(`
                SELECT id FROM booking 
                WHERE halls_id = ? 
                AND event_date = ?
                AND (
                    (? < event_end_time AND ? > event_start_time) OR
                    (? > event_start_time AND ? < event_end_time) OR
                    (? <= event_start_time AND ? >= event_end_time)
                )
            `, [
                hallId, eventDate,
                startTime, endTime,
                startTime, endTime,
                startTime, endTime
            ]);
    
            if (conflicts.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Time slot conflicts with existing booking',
                    conflictingBookings: conflicts
                });
            }

            // 4. Check for vacation days
            const [vacation] = await pool.query(
                'SELECT id FROM vacation_days WHERE Halls_id = ? AND date = ?',
                [hallId, eventDate]
            );
            if (vacation.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Hall is on vacation on this date'
                });
            }

            // 5. Calculate price
            const durationHours = (new Date(`1970-01-01 ${endTime}`) - new Date(`1970-01-01 ${startTime}`)) / (1000 * 60 * 60);
            const totalPrice = durationHours * hall[0].price_per_hour;

            // 6. Create booking
            const [result] = await pool.query(
                `INSERT INTO booking (
                    customer_id, 
                    halls_id, 
                    event_date, 
                    event_start_time, 
                    event_end_time, 
                    total_hall_price,
                    approval,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?,'waiting', NOW())`,
                [customer[0].id, hallId, eventDate, startTime, endTime, totalPrice]
            );

            return res.status(201).json({
                success: true,
                data: {
                    bookingId: result.insertId,
                    totalPrice,
                    eventDate,
                    timeSlot: `${startTime} - ${endTime}`
                },
                message: 'Booking created successfully'
            });

        } catch (error) {
            console.error('Booking error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create booking',
                error: error.message
            });
        }
    },

    updateBookingStatus: async (req, res) => {
        try {
            const ownerId = req.user.id;
            const { bookingId } = req.params;
            const { status } = req.body; // 'approved' or 'rejected'

            // Validate status
            if (!['approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status must be either "approved" or "rejected"'
                });
            }

            // Verify the booking belongs to owner's hall
            const [booking] = await pool.query(`
                SELECT b.id FROM booking b
                JOIN halls h ON b.halls_id = h.id
                JOIN owner o ON h.owner_id = o.id
                WHERE b.id = ? AND o.user_id = ?
            `, [bookingId, ownerId]);

            if (!booking.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found or not authorized'
                });
            }

            // Update status
            await pool.query(
                'UPDATE booking SET approval = ? WHERE id = ?',
                [status, bookingId]
            );

            return res.status(200).json({
                success: true,
                message: `Booking ${status} successfully`
            });

        } catch (error) {
            console.error('Status update error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update booking status'
            });
        }
    },
    
    getHallBookings : async (req, res) => {
        try {
            const hallId = req.params.hallId;
            const ownerId = req.user.id; // Verify owner owns the hall
    
            // First verify ownership
            const [hall] = await pool.query(
                'SELECT id FROM halls WHERE id = ? AND owner_id = (SELECT id FROM owner WHERE user_id = ?)',
                [hallId, ownerId]
            );
    
            if (!hall.length) {
                return res.status(403).json({
                    success: false,
                    message: 'Hall not found or access denied'
                });
            }
    
            // Get all bookings with full details
            const [bookings] = await pool.query(`
                SELECT 
                    b.id,
                    b.event_date,
                    b.event_start_time,
                    b.event_end_time,
                    b.total_hall_price,
                    b.approval,
                    b.created_at,
                    CONCAT(u.fname, ' ', u.lname) AS customer_name,
                    u.email AS customer_email,
                    c.name AS city
                FROM booking b
                JOIN customer cus ON b.customer_id = cus.id
                JOIN user u ON cus.user_id = u.id
                JOIN city c ON u.city_id = c.id
                WHERE b.halls_id = ?
                ORDER BY b.event_date DESC, b.event_start_time DESC
            `, [hallId]);
    
            return res.status(200).json({
                success: true,
                data: bookings,
                count: bookings.length
            });
    
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve bookings'
            });
        }
    },
    updateBooking : async (req, res) => {
        try {
            const bookingId = req.params.id;
            const ownerId = req.user.id;
            const updates = req.body;
    
            // Validate updatable fields
            const validFields = ['event_date', 'event_start_time', 'event_end_time', 'approval'];
            const updateFields = {};
            
            for (const [key, value] of Object.entries(updates)) {
                if (validFields.includes(key)) {
                    updateFields[key] = value;
                }
            }
    
            if (Object.keys(updateFields).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid fields to update'
                });
            }
    
            // Verify ownership and get current booking
            const [booking] = await pool.query(`
                SELECT b.* FROM booking b
                JOIN halls h ON b.halls_id = h.id
                JOIN owner o ON h.owner_id = o.id
                WHERE b.id = ? AND o.user_id = ?
            `, [bookingId, ownerId]);
    
            if (!booking.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found or access denied'
                });
            }
    
            // Check for time conflicts (excluding current booking)
            if (updateFields.event_date || updateFields.event_start_time || updateFields.event_end_time) {
                const eventDate = updateFields.event_date || booking[0].event_date;
                const startTime = updateFields.event_start_time || booking[0].event_start_time;
                const endTime = updateFields.event_end_time || booking[0].event_end_time;
    
                const [conflicts] = await pool.query(`
                    SELECT id FROM booking 
                    WHERE halls_id = ? 
                    AND id != ?
                    AND event_date = ?
                    AND (
                        (? < event_end_time AND ? > event_start_time)
                    )
                `, [booking[0].halls_id, bookingId, eventDate, startTime, endTime]);
    
                if (conflicts.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: 'Updated time conflicts with existing booking',
                        conflictingBookingId: conflicts[0].id
                    });
                }
            }
    
            // Build dynamic update query
            const setClause = Object.keys(updateFields)
                .map(field => `${field} = ?`)
                .join(', ');
    
            const query = `
                UPDATE booking 
                SET ${setClause}, updated_at = NOW()
                WHERE id = ?
            `;
    
            await pool.query(query, [...Object.values(updateFields), bookingId]);
    
            return res.status(200).json({
                success: true,
                message: 'Booking updated successfully'
            });
    
        } catch (error) {
            console.error('Update booking error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update booking'
            });
        }
    }
    
};


module.exports = bookingController;