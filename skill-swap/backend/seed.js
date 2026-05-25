const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const db = require("./config/db");

const mockUsers = [
  {
    name: "Sarah Jenkins",
    email: "sarah@gmail.com",
    password: "password123",
    skills_offered: ["UI/UX", "Figma", "CSS"],
    skills_wanted: ["React", "Python"],
    bio: "Senior product designer looking to swap for React coding skills. Certified expert in Figma.",
    profile_pic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    credit_points: 12,
    rating: 4.8,
    badge: "EXPERT"
  },
  {
    name: "Alex Rivera",
    email: "alex@gmail.com",
    password: "password123",
    skills_offered: ["Spanish", "Guitar"],
    skills_wanted: ["Java", "SQL"],
    bio: "Expert guitarist and native Spanish speaker. Certified tutor.",
    profile_pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    credit_points: 8,
    rating: 4.9,
    badge: "PRO"
  },
  {
    name: "Maya Patel",
    email: "maya@gmail.com",
    password: "password123",
    skills_offered: ["Python", "Machine Learning"],
    skills_wanted: ["Spanish", "Figma"],
    bio: "Data scientist who wants to learn Spanish conversational speaking and basic UI design.",
    profile_pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    credit_points: 15,
    rating: 4.7,
    badge: "VERIFIED"
  },
  {
    name: "David Kim",
    email: "david@gmail.com",
    password: "password123",
    skills_offered: ["React", "Node.js", "Express"],
    skills_wanted: ["Machine Learning"],
    bio: "Web developer wanting to explore artificial intelligence and machine learning basics.",
    profile_pic: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200",
    credit_points: 10,
    rating: 4.6,
    badge: "VERIFIED"
  },
  {
    name: "Emily Wong",
    email: "emily@gmail.com",
    password: "password123",
    skills_offered: ["Guitar", "Piano", "Music Theory"],
    skills_wanted: ["Node.js", "React"],
    bio: "Music teacher looking to build a personal website portfolio. Expert in acoustic guitar.",
    profile_pic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    credit_points: 11,
    rating: 4.9,
    badge: "EXPERT"
  }
];

async function seed() {
  try {
    // Wait for DB initialization
    await db.initDb();
    console.log("Seeding mock users...");

    for (const u of mockUsers) {
      const existing = await db.query("SELECT id FROM users WHERE email = $1", [u.email]);
      if (existing.rows.length > 0) {
        console.log(`User ${u.email} already exists, updating...`);
        await db.query(
          `UPDATE users 
           SET name = $1, skills_offered = $2, skills_wanted = $3, bio = $4, profile_pic = $5, credit_points = $6, rating = $7, badge = $8
           WHERE email = $9`,
          [u.name, u.skills_offered, u.skills_wanted, u.bio, u.profile_pic, u.credit_points, u.rating, u.badge, u.email]
        );
      } else {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await db.query(
          `INSERT INTO users (name, email, password, skills_offered, skills_wanted, bio, profile_pic, credit_points, rating, badge)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [u.name, u.email, hashedPassword, u.skills_offered, u.skills_wanted, u.bio, u.profile_pic, u.credit_points, u.rating, u.badge]
        );
        console.log(`Created user: ${u.email}`);
      }
    }

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
