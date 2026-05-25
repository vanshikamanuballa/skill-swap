const db = require('../config/db');

class Message {
  static async create(senderId, receiverId, message) {
    const res = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *`,
      [senderId, receiverId, message]
    );
    return res.rows[0];
  }

  static async getHistory(userId, targetId) {
    const res = await db.query(
      `SELECT id, sender_id, receiver_id, message, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId, targetId]
    );
    return res.rows;
  }
}

module.exports = Message;
