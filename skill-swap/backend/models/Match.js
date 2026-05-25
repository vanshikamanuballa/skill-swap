const db = require('../config/db');

class Match {
  static async connect(userId, targetId) {
    const u1 = Math.min(userId, targetId);
    const u2 = Math.max(userId, targetId);

    await db.query(
      `INSERT INTO connections (user1_id, user2_id, status)
       VALUES ($1, $2, 'connected')
       ON CONFLICT (user1_id, user2_id) DO NOTHING`,
      [u1, u2]
    );
  }

  static async getConnections(userId) {
    const res = await db.query(
      `SELECT u.id, u.name, u.skills_offered, u.skills_wanted, u.bio, u.profile_pic, u.badge
       FROM users u
       JOIN connections c ON (c.user1_id = u.id OR c.user2_id = u.id)
       WHERE (c.user1_id = $1 OR c.user2_id = $1) AND u.id != $1`,
      [userId]
    );
    return res.rows;
  }
}

module.exports = Match;
