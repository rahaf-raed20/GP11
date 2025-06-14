const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/token');

const User = {
  // Create new user
  async create(userData) {
    const { fname, mname, lname, email, password, city_id, type } = userData;
    
    // Validate user type
    if (![1, 2, 3, 4].includes(type)) {
        throw new Error('Invalid user type');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let connection;
    
    try {
        // Get a connection from the pool
        connection = await pool.getConnection();
        
        // Begin transaction
        await connection.beginTransaction();

        // 1. Insert into user table
        const [userResult] = await connection.query(
            `INSERT INTO user (fname, mname, lname, email, password, city_id, refresh_token) 
             VALUES (?, ?, ?, ?, ?, ?, NULL)`,
            [fname, mname || null, lname, email, hashedPassword, city_id]
        );
        
        const userId = userResult.insertId;

        // 2. Insert into the appropriate role table based on type
        let roleTable, roleQuery;
        switch(type) {
            case 1: // customer
                roleTable = 'customer';
                break;
            case 2: // owner
                roleTable = 'owner';
                break;
            case 3: // third_party
                roleTable = 'third_party';
                break;
            case 4: // admin
                roleTable = 'admin';
                break;
        }

        await connection.query(
            `INSERT INTO ${roleTable} (user_id) VALUES (?)`,
            [userId]
        );

        // Commit transaction
        await connection.commit();

        return userId;
    } catch (error) {
        // Rollback transaction if error occurs
        if (connection) await connection.rollback();
        console.error('User creation error:', error);
        throw error; // Re-throw the error for the controller to handle
    } finally {
        // Release the connection back to the pool
        if (connection) connection.release();
    }
 },

  // In models/User.js
async findByEmail(email) {
    // First get the base user
    const [userRows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
    if (!userRows[0]) return null;
    
    const user = userRows[0];
    
    // Determine user type by checking which role table they exist in
    const [customer] = await pool.query('SELECT 1 FROM customer WHERE user_id = ?', [user.id]);
    if (customer.length) {
        user.type = 1;
        return user;
    }
    
    const [owner] = await pool.query('SELECT 1 FROM owner WHERE user_id = ?', [user.id]);
    if (owner.length) {
        user.type = 2;
        return user;
    }
    
    const [thirdParty] = await pool.query('SELECT 1 FROM third_party WHERE user_id = ?', [user.id]);
    if (thirdParty.length) {
        user.type = 3;
        return user;
    }
    
    const [admin] = await pool.query('SELECT 1 FROM admin WHERE user_id = ?', [user.id]);
    if (admin.length) {
        user.type = 4;
        return user;
    }
    
    // Default case (shouldn't happen if data is consistent)
    user.type = 0;
    return user;
 },

  // Find user by ID
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // Verify password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Store refresh token in database
  async storeRefreshToken(userId, token) {
    await pool.query('UPDATE user SET refresh_token = ? WHERE id = ?', [token, userId]);
  },

  // Remove refresh token (logout)
  async removeRefreshToken(userId) {
    await pool.query('UPDATE user SET refresh_token = NULL WHERE id = ?', [userId]);
  },

  // Verify refresh token exists for user
  async verifyRefreshToken(userId, token) {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND refresh_token = ?',
      [userId, token]
    );
    return rows.length > 0;
  },

// Get all users with their types
async getAllUsers() {
  const [users] = await pool.query(`
    SELECT 
      u.id, u.fname, u.mname, u.lname, u.email, u.password, u.city_id, u.image_url,
      CASE
        WHEN c.user_id IS NOT NULL THEN 1
        WHEN o.user_id IS NOT NULL THEN 2
        WHEN tp.user_id IS NOT NULL THEN 3
        WHEN a.user_id IS NOT NULL THEN 4
        ELSE 0
      END AS type
    FROM user u
    LEFT JOIN customer c ON u.id = c.user_id
    LEFT JOIN owner o ON u.id = o.user_id
    LEFT JOIN third_party tp ON u.id = tp.user_id
    LEFT JOIN admin a ON u.id = a.user_id
  `);
  return users;
},

// Get users filtered by type
async getUsersByType(type) {
  let joinTable, typeValue;
  
  switch(type) {
    case 1: // customer
      joinTable = 'customer';
      typeValue = 1;
      break;
    case 2: // owner
      joinTable = 'owner';
      typeValue = 2;
      break;
    case 3: // third_party
      joinTable = 'third_party';
      typeValue = 3;
      break;
    case 4: // admin
      joinTable = 'admin';
      typeValue = 4;
      break;
    default:
      throw new Error('Invalid user type');
  }

  const [users] = await pool.query(`
    SELECT 
      u.id, u.fname, u.mname, u.lname, u.email, u.password, u.city_id, u.image_url,
      ? AS type
    FROM user u
    JOIN ${joinTable} r ON u.id = r.user_id
  `, [typeValue]);
  
  return users;
},

// Search users by email
async searchByEmail(email) {
  const [users] = await pool.query(`
    SELECT 
      u.id, u.fname, u.mname, u.lname, u.email, u.password, u.city_id, u.image_url,
      CASE
        WHEN c.user_id IS NOT NULL THEN 1
        WHEN o.user_id IS NOT NULL THEN 2
        WHEN tp.user_id IS NOT NULL THEN 3
        WHEN a.user_id IS NOT NULL THEN 4
        ELSE 0
      END AS type
    FROM user u
    LEFT JOIN customer c ON u.id = c.user_id
    LEFT JOIN owner o ON u.id = o.user_id
    LEFT JOIN third_party tp ON u.id = tp.user_id
    LEFT JOIN admin a ON u.id = a.user_id
    WHERE u.email LIKE ?
  `, [`%${email}%`]);
  
  return users;
},

// Update user
async update(id, userData) {
  const { fname, mname, lname, email, password, city_id } = userData;
  let updates = [];
  let params = [];

  if (fname) {
    updates.push('fname = ?');
    params.push(fname);
  }
  if (mname) {
    updates.push('mname = ?');
    params.push(mname);
  }
  if (lname) {
    updates.push('lname = ?');
    params.push(lname);
  }
  if (email) {
    updates.push('email = ?');
    params.push(email);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.push('password = ?');
    params.push(hashedPassword);
  }
  if (city_id) {
    updates.push('city_id = ?');
    params.push(city_id);
  }

  if (updates.length === 0) {
    throw new Error('No valid fields to update');
  }

  params.push(id);
  
  await pool.query(
    `UPDATE user SET ${updates.join(', ')} WHERE id = ?`,
    params
  );
},

// Delete user (with transaction to handle role tables)
async delete(id) {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Delete from role tables
    await connection.query('DELETE FROM customer WHERE user_id = ?', [id]);
    await connection.query('DELETE FROM owner WHERE user_id = ?', [id]);
    await connection.query('DELETE FROM third_party WHERE user_id = ?', [id]);
    await connection.query('DELETE FROM admin WHERE user_id = ?', [id]);

    // 2. Delete from user table
    await connection.query('DELETE FROM user WHERE id = ?', [id]);

    await connection.commit();
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
},

// Impersonate user (generate tokens directly)
async impersonate(userId) {
  const user = await this.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Determine user type
  const userWithType = await this.findByEmail(user.email);
  
  return {
    accessToken: generateAccessToken(userWithType),
    refreshToken: generateRefreshToken(userWithType),
    type: userWithType.type
  };
}
};

module.exports = User;