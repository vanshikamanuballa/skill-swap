const db = require('../config/db');

class User {
  static async create({ name, email, password }) {
    const res = await db.query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email`,
      [name, email, password]
    );
    return res.rows[0];
  }

  static async findByEmail(email) {
    const res = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return res.rows[0];
  }

  static async findById(id) {
    const res = await db.query(
      `SELECT id, name, email, skills_offered, skills_wanted, bio, profile_pic, credit_points, rating, badge, created_at FROM users WHERE id = $1`,
      [id]
    );
    return res.rows[0];
  }

  static async findAllExcept(id) {
    const res = await db.query(
      `SELECT id, name, skills_offered, skills_wanted, bio, profile_pic, credit_points, rating, badge FROM users WHERE id != $1`,
      [id]
    );
    return res.rows;
  }

  static async update(id, { name, skillsOffered, skillsWanted, bio, profilePic, badge }) {
    const res = await db.query(
      `UPDATE users 
       SET name = $1, skills_offered = $2, skills_wanted = $3, bio = $4, profile_pic = COALESCE($5, profile_pic), badge = $6
       WHERE id = $7 
       RETURNING id, name, email, skills_offered, skills_wanted, bio, profile_pic, credit_points, rating, badge`,
      [name, skillsOffered || [], skillsWanted || [], bio || "", profilePic || null, badge, id]
    );
    return res.rows[0];
  }
}

module.exports = User;