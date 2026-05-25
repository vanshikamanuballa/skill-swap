import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

interface MatchedUser {
  id: number;
  name: string;
  skills_offered: string[];
  skills_wanted: string[];
  bio: string;
  profile_pic: string;
  credit_points: number;
  rating: number;
  badge: string;
  matchPercentage: number;
}

function Matches() {
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/matches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMatches(data);
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
        }
      } catch (error) {
        console.error("Matches fetch error:", error);
        setErrorMsg("Failed to connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [navigate]);

  const handleConnect = async (targetUser: MatchedUser) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetId: targetUser.id }),
      });

      if (response.ok) {
        // Save partner info in localStorage so the chat page loads them instantly
        localStorage.setItem("chatPartnerId", targetUser.id.toString());
        localStorage.setItem("chatPartnerName", targetUser.name);
        localStorage.setItem("chatPartnerPic", targetUser.profile_pic);
        navigate("/chat");
      } else {
        alert("Failed to connect with user.");
      }
    } catch (error) {
      console.error("Connect user error:", error);
      alert("Error connecting to server.");
    }
  };

  const filteredMatches = matches.filter((user) => {
    const matchSearch = search.toLowerCase();
    const offeredStr = (user.skills_offered || []).join(" ").toLowerCase();
    const wantedStr = (user.skills_wanted || []).join(" ").toLowerCase();
    
    return (
      offeredStr.includes(matchSearch) ||
      wantedStr.includes(matchSearch) ||
      (user.name || "").toLowerCase().includes(matchSearch)
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Finding your matches...</p>
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
    <div className="matches-page">
      <Navbar />

      <main className="matches-content">
        <header className="matches-header">
          <h1>Find Skill Matches</h1>
          <p>Peers sorted by compatibility based on what they want to teach and what you want to learn.</p>

          <div className="search-bar-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, skill, etc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        {filteredMatches.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <h3>No matches found</h3>
            <p>Try searching for other keywords, or adjust your skills on your Profile.</p>
            <button onClick={() => navigate("/profile")} className="action-btn primary-btn">
              Go to Profile
            </button>
          </div>
        ) : (
          <div className="matches-grid">
            {filteredMatches.map((user) => (
              <div key={user.id} className="glass-card match-card">
                <div className="match-badge">{user.matchPercentage}% Match</div>

                <div className="match-card-header">
                  <img
                    src={user.profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"}
                    alt={user.name}
                    className="match-avatar"
                  />
                  <div className="match-name-section">
                    <h3>{user.name}</h3>
                    <span className={`badge ${user.badge.toLowerCase()}`}>
                      {user.badge}
                    </span>
                  </div>
                </div>

                <div className="match-card-body">
                  <p className="match-bio">"{user.bio || "No description provided."}"</p>

                  <div className="match-skills">
                    <div className="match-skill-tag teach">
                      <span className="tag-label">Teaches:</span>
                      <span className="tag-value">{user.skills_offered?.join(", ") || "None"}</span>
                    </div>
                    <div className="match-skill-tag learn">
                      <span className="tag-label">Wants to learn:</span>
                      <span className="tag-value">{user.skills_wanted?.join(", ") || "None"}</span>
                    </div>
                  </div>

                  <div className="match-footer-info">
                    <span className="match-rating">⭐ {user.rating ? parseFloat(user.rating.toString()).toFixed(1) : "5.0"}</span>
                    <span className="match-credits">🪙 {user.credit_points} credits</span>
                  </div>
                </div>

                <button onClick={() => handleConnect(user)} className="connect-btn">
                  Connect & Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Matches;