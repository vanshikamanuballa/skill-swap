import React from "react";
import { NavLink } from "react-router-dom";

interface UserProfile {
  name: string;
  badge: string;
  credit_points: number;
  profile_pic: string;
}

export const Sidebar: React.FC = () => {
  // Load user from localStorage
  const userString = localStorage.getItem("user");
  const defaultUser: UserProfile = {
    name: "Bhavya",
    badge: "EXPERT",
    credit_points: 10,
    profile_pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
  };

  const user: UserProfile = userString ? JSON.parse(userString) : defaultUser;

  return (
    <aside className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px", minWidth: "250px", height: "fit-content" }}>
      {/* Short Profile Info */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "20px" }}>
        <img 
          src={user.profile_pic || defaultUser.profile_pic} 
          alt="Avatar" 
          style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #8b5cf6", marginBottom: "12px" }}
        />
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "4px" }}>{user.name}</h3>
        <span className={`badge-tag ${user.badge ? user.badge.toLowerCase() : "learner"}`}>
          {user.badge || "LEARNER"}
        </span>
      </div>

      {/* Stats Widget */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "1px", fontWeight: "800" }}>Swap Wallet</h4>
        <div className="glass-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "12px", borderStyle: "solid" }}>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Credits</span>
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#a855f7" }}>{user.credit_points ?? 10} 🪙</span>
        </div>
      </div>

      {/* Quick Navigation Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "1px", fontWeight: "800", marginBottom: "6px" }}>Quick Menu</h4>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} style={{ display: "block", textDecoration: "none", fontSize: "14px", padding: "10px 14px" }}>
          🌐 Dashboard
        </NavLink>
        <NavLink to="/matches" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} style={{ display: "block", textDecoration: "none", fontSize: "14px", padding: "10px 14px" }}>
          🔥 Skill Matches
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} style={{ display: "block", textDecoration: "none", fontSize: "14px", padding: "10px 14px" }}>
          💬 Active Chats
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} style={{ display: "block", textDecoration: "none", fontSize: "14px", padding: "10px 14px" }}>
          ⚙️ Edit Profile
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
