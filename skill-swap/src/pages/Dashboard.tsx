import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  skills_offered: string[];
  skills_wanted: string[];
  bio: string;
  profile_pic: string;
  credit_points: number;
  rating: number;
  badge: string;
}

function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          localStorage.setItem("user", JSON.stringify(data));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
        }
      } catch (error) {
        console.error("Dashboard profile fetch error:", error);
        setErrorMsg("Failed to connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>Connection Error</h2>
          <p>{errorMsg}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-content">
        {/* Welcome Section */}
        <section className="welcome-banner">
          <div className="welcome-avatar-wrapper">
            <img
              src={profile?.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"}
              alt={profile?.name}
              className="welcome-avatar"
            />
          </div>
          <div className="welcome-text">
            <h1>Welcome, {profile?.name}! 👋</h1>
            <p className="welcome-subtitle">
              {profile?.bio || "Swap skills, share knowledge, grow together."}
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          {/* Credit Points */}
          <div className="glass-card stat-card">
            <div className="stat-icon">🪙</div>
            <div className="stat-info">
              <h3>Credit Points</h3>
              <p className="stat-value">{profile?.credit_points}</p>
            </div>
            <div className="stat-desc">Used to request skill swaps</div>
          </div>

          {/* Rating */}
          <div className="glass-card stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>Swap Rating</h3>
              <p className="stat-value">
                {profile?.rating ? parseFloat(profile.rating.toString()).toFixed(1) : "5.0"}
              </p>
            </div>
            <div className="stat-desc">Based on peer reviews</div>
          </div>

          {/* Badge */}
          <div className="glass-card stat-card">
            <div className="stat-icon">🏅</div>
            <div className="stat-info">
              <h3>User Status</h3>
              <p className="stat-value badge-text">{profile?.badge}</p>
            </div>
            <div className="stat-desc">Based on verified teaching skills</div>
          </div>
        </section>

        {/* Info Grid */}
        <section className="info-grid">
          {/* Your Skills Card */}
          <div className="glass-card info-card">
            <h2>Your Swap Profile</h2>

            <div className="skill-swap-details">
              <div className="skill-box teach">
                <span className="skill-label">TEACHING</span>
                <span className="skill-name">
                  {profile?.skills_offered?.join(", ") || "Not specified yet"}
                </span>
              </div>
              <div className="swap-arrow">🔁</div>
              <div className="skill-box learn">
                <span className="skill-label">LEARNING</span>
                <span className="skill-name">
                  {profile?.skills_wanted?.join(", ") || "Not specified yet"}
                </span>
              </div>
            </div>

            <button onClick={() => navigate("/profile")} className="action-btn outline-btn">
              Edit Skills & Bio
            </button>
          </div>

          {/* Discover Matches Card */}
          <div className="glass-card info-card quick-actions-card">
            <h2>Swapping Community</h2>
            <p>Connect with peers who teach what you want to learn, and learn what they want to teach!</p>

            <div className="action-buttons-group">
              <Link to="/matches" className="action-btn primary-btn text-center">
                Find Skill Matches 🔍
              </Link>
              <Link to="/chat" className="action-btn secondary-btn text-center">
                Open Chats 💬
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;