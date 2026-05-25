import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("chatPartnerId");
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => navigate("/dashboard")}>
        <span className="logo-sparkle">✨</span>Skill Swap
      </div>
      <div className="nav-links">
        <Link to="/dashboard" className={isActive("/dashboard")}>Home</Link>
        <Link to="/matches" className={isActive("/matches")}>Matches</Link>
        <Link to="/chat" className={isActive("/chat")}>Chats</Link>
        <Link to="/profile" className={isActive("/profile")}>Profile</Link>
      </div>
      <div className="nav-actions">
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
