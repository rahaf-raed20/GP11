const pool = require('../config/db');

const vacationController = {
    // Add vacation date
    addVacation: async (req, res) => {
        try {
            const { hall_id, date } = req.body;
            const userId = req.user.id;

            const [owner] = await pool.query(
                'SELECT id FROM owner WHERE user_id = ?', 
                [userId]    
            );
            // Validate required fields
            if (!hall_id || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Hall ID and date are required'
                });
            }

            // Verify the hall belongs to the owner
            const [hall] = await pool.query(
                'SELECT id FROM halls WHERE id = ? AND owner_id = ?',
                [hall_id, owner[0].id]
            );

            if (!hall.length) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not own this hall'
                });
            }

            // Check if vacation date already exists
            const [existing] = await pool.query(
                'SELECT id FROM vacation_days WHERE Halls_id = ? AND date = ?',
                [hall_id, date]
            );

            if (existing.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Vacation date already exists'
                });
            }

            // Add vacation date
            const [result] = await pool.query(
                'INSERT INTO vacation_days (date, Halls_id) VALUES (?, ?)',
                [date, hall_id]
            );

            return res.status(201).json({
                success: true,
                data: { id: result.insertId, date, hall_id },
                message: 'Vacation date added successfully'
            });

        } catch (error) {
            console.error('Error adding vacation:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to add vacation date'
            });
        }
    },

    // Update vacation date
    updateVacation: async (req, res) => {
        try {
            const { id } = req.params;
            const { date } = req.body;
            const userId = req.user.id;

            const [owner] = await pool.query(
                'SELECT id FROM owner WHERE user_id = ?', 
                [userId]    
            );

            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'Date is required'
                });
            }

            // Verify the vacation belongs to the owner's hall
            const [vacation] = await pool.query(`
                SELECT v.id FROM vacation_days v
                JOIN halls h ON v.Halls_id = h.id
                WHERE v.id = ? AND h.owner_id = ?
            `, [id, owner[0].id]);

            if (!vacation.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Vacation not found or access denied'
                });
            }

            // Check if new date already exists
            const [existing] = await pool.query(
                'SELECT id FROM vacation_days WHERE Halls_id = ? AND date = ? AND id != ?',
                [vacation[0].Halls_id, date, id]
            );

            if (existing.length) {
                return res.status(400).json({
                    success: false,
                    message: 'This date is already marked as vacation'
                });
            }

            // Update vacation date
            await pool.query(
                'UPDATE vacation_days SET date = ? WHERE id = ?',
                [date, id]
            );

            return res.status(200).json({
                success: true,
                message: 'Vacation date updated successfully'
            });

        } catch (error) {
            console.error('Error updating vacation:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update vacation date'
            });
        }
    },

    // Get all vacation days for a hall
    getHallVacations: async (req, res) => {
        try {
            const { hall_id } = req.params;
            const userId = req.user.id;

            const [owner] = await pool.query(
                'SELECT id FROM owner WHERE user_id = ?', 
                [userId]    
            );

            // Verify the hall belongs to the owner
            const [hall] = await pool.query(
                'SELECT id FROM halls WHERE id = ? AND owner_id = ?',
                [hall_id, owner[0].id]
            );

            if (!hall.length) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not own this hall'
                });
            }

            // Get all vacation days
            const [vacations] = await pool.query(
                'SELECT id, date FROM vacation_days WHERE Halls_id = ? ORDER BY date',
                [hall_id]
            );

            return res.status(200).json({
                success: true,
                data: vacations,
                message: 'Vacation days retrieved successfully'
            });

        } catch (error) {
            console.error('Error fetching vacations:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve vacation days'
            });
        }
    },

    // Delete vacation date
    deleteVacation: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const [owner] = await pool.query(
                'SELECT id FROM owner WHERE user_id = ?', 
                [userId]    
            );

            // Verify the vacation belongs to the owner's hall
            const [vacation] = await pool.query(`
                SELECT v.id FROM vacation_days v
                JOIN halls h ON v.Halls_id = h.id
                WHERE v.id = ? AND h.owner_id = ?
            `, [id, owner[0].id]);

            if (!vacation.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Vacation not found or access denied'
                });
            }

            // Delete vacation date
            await pool.query(
                'DELETE FROM vacation_days WHERE id = ?',
                [id]
            );

            return res.status(200).json({
                success: true,
                message: 'Vacation date deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting vacation:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete vacation date'
            });
        }
    }
};

module.exports = vacationController;