const pool = require('../config/db');
const bcrypt = require('bcrypt');

const profileController = {
    // Get my profile
    getMyProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            
            const [user] = await pool.query(`
                SELECT 
                    u.id, u.fname, u.mname, u.lname, u.email, 
                    u.city_id, c.name as city_name, image_url ,
                    CASE 
                        WHEN a.id IS NOT NULL THEN 'admin'
                        WHEN o.id IS NOT NULL THEN 'owner'
                        WHEN t.id IS NOT NULL THEN 'third_party'
                        WHEN cu.id IS NOT NULL THEN 'customer'
                        ELSE 'unknown'
                    END as role
                FROM user u
                LEFT JOIN admin a ON a.user_id = u.id
                LEFT JOIN owner o ON o.user_id = u.id
                LEFT JOIN third_party t ON t.user_id = u.id
                LEFT JOIN customer cu ON cu.user_id = u.id
                JOIN city c ON u.city_id = c.id
                WHERE u.id = ?
            `, [userId]);

            if (!user.length) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                data: user[0],
                message: 'Profile retrieved successfully'
            });

        } catch (error) {
            console.error('Error fetching profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve profile'
            });
        }
    },

    // Update my profile
    updateMyProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { 
                fname, 
                mname, 
                lname, 
                email, 
                city_id,
                current_password,
                new_password 
            } = req.body;

            // First get current user data
            const [currentUser] = await pool.query(
                'SELECT * FROM user WHERE id = ?', 
                [userId]
            );

            if (!currentUser.length) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Prepare update fields
            const updateFields = {};
            const updateValues = [];

            if (fname) {
                updateFields.fname = fname;
                updateValues.push(`fname = ?`);
            }
            if (mname !== undefined) { // Allow empty string
                updateFields.mname = mname;
                updateValues.push(`mname = ?`);
            }
            if (lname) {
                updateFields.lname = lname;
                updateValues.push(`lname = ?`);
            }
            if (email) {
                // Check if email already exists
                const [existing] = await pool.query(
                    'SELECT id FROM user WHERE email = ? AND id != ?', 
                    [email, userId]
                );
                if (existing.length) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already in use'
                    });
                }
                updateFields.email = email;
                updateValues.push(`email = ?`);
            }
            if (city_id) {
                updateFields.city_id = city_id;
                updateValues.push(`city_id = ?`);
            }

            // Handle password change if requested
            if (new_password) {
                if (!current_password) {
                    return res.status(400).json({
                        success: false,
                        message: 'Current password is required to change password'
                    });
                }

                const validPassword = await bcrypt.compare(
                    current_password, 
                    currentUser[0].password
                );

                if (!validPassword) {
                    return res.status(401).json({
                        success: false,
                        message: 'Current password is incorrect'
                    });
                }

                const salt = await bcrypt.genSalt(10);
                updateFields.password = await bcrypt.hash(new_password, salt);
                updateValues.push(`password = ?`);
            }

            // If no fields to update
            if (updateValues.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields to update'
                });
            }

            // Build and execute update query
            const query = `
                UPDATE user 
                SET ${updateValues.join(', ')}
                WHERE id = ?
            `;
            
            const params = [...Object.values(updateFields), userId];
            
            await pool.query(query, params);

            // Return updated profile
            const [updatedUser] = await pool.query(`
                SELECT 
                    id, fname, mname, lname, email, city_id
                FROM user 
                WHERE id = ?
            `, [userId]);

            return res.status(200).json({
                success: true,
                data: updatedUser[0],
                message: 'Profile updated successfully'
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    }
};

module.exports = profileController;