import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150",
];

function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skillsOfferedInput, setSkillsOfferedInput] = useState("");
  const [skillsWantedInput, setSkillsWantedInput] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [customPicUrl, setCustomPicUrl] = useState("");

  // Certificate states (Mocked locally)
  const [certificateName, setCertificateName] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
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

          // Pre-populate form
          setName(data.name);
          setBio(data.bio || "");
          setSkillsOfferedInput((data.skills_offered || []).join(", "));
          setSkillsWantedInput((data.skills_wanted || []).join(", "));
          setProfilePic(data.profile_pic || "");

          if (!PRESET_AVATARS.includes(data.profile_pic)) {
            setCustomPicUrl(data.profile_pic || "");
          }
        } else {
          localStorage.removeItem("token");
          navigate("/");
        }
      } catch (error) {
        console.error("Profile load error:", error);
        setMsg({ type: "error", text: "Failed to fetch profile details." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const cert = localStorage.getItem("mock_certificate");
    if (cert) {
      setCertificateName(cert);
      setIsVerified(true);
    }
  }, [navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    setMsg({ type: "", text: "" });

    const finalPic = customPicUrl.trim() !== "" ? customPicUrl : profilePic;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          skillsOffered: skillsOfferedInput.split(",").map(s => s.trim()).filter(Boolean),
          skillsWanted: skillsWantedInput.split(",").map(s => s.trim()).filter(Boolean),
          bio,
          profilePic: finalPic,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setIsEditing(false);
        setMsg({ type: "success", text: "Profile updated successfully!" });
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setMsg({ type: "error", text: data.message || "Failed to update profile." });
      }
    } catch (error) {
      console.error("Profile save error:", error);
      setMsg({ type: "error", text: "Server error updating profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateName(file.name);
      setIsVerified(true);
      localStorage.setItem("mock_certificate", file.name);
      setMsg({ type: "success", text: "Certificate uploaded successfully!" });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />

      <main className="profile-content">
        <div className="glass-card profile-card">
          {msg.text && (
            <div className={`toast-alert ${msg.type === "success" ? "success" : "error"}`}>
              {msg.text}
            </div>
          )}

          {/* Profile View / Edit Header */}
          <div className="profile-header-layout">
            <div className="profile-avatar-section">
              <img
                src={
                  profile?.profile_pic ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"
                }
                alt={profile?.name}
                className="profile-display-pic"
              />
              <div className="profile-main-info">
                <h2>{profile?.name}</h2>
                <p className="profile-email">{profile?.email}</p>
                <div className="badge-row">
                  <span className={`badge ${profile?.badge.toLowerCase()}`}>
                    {profile?.badge}
                  </span>
                  {isVerified && (
                    <span className="badge verified-cert-badge">✓ Verified Certificates</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setMsg({ type: "", text: "" });
              }}
              className="edit-toggle-btn"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <hr className="divider" />

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="profile-edit-form">
              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Skills You Can Teach (Comma-separated)</label>
                  <input
                    type="text"
                    value={skillsOfferedInput}
                    onChange={(e) => setSkillsOfferedInput(e.target.value)}
                    placeholder="e.g. Java, React, Photoshop"
                  />
                </div>

                <div className="input-group">
                  <label>Skills You Want to Learn (Comma-separated)</label>
                  <input
                    type="text"
                    value={skillsWantedInput}
                    onChange={(e) => setSkillsWantedInput(e.target.value)}
                    placeholder="e.g. UI/UX Design, Node.js"
                  />
                </div>

                <div className="input-group">
                  <label>Short Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Introduce yourself to other swappers..."
                    rows={3}
                  />
                  <small className="tip-text">
                    💡 <b>Pro Tip:</b> Include "expert" or "certified" in your bio to level up your status badge!
                  </small>
                </div>
              </div>

              {/* Avatar Picker */}
              <div className="avatar-picker-section">
                <label>Choose Profile Picture</label>
                <div className="avatar-presets">
                  {PRESET_AVATARS.map((pic, idx) => (
                    <img
                      key={idx}
                      src={pic}
                      alt={`Avatar preset ${idx + 1}`}
                      className={`avatar-preset-img ${
                        profilePic === pic && customPicUrl === "" ? "selected" : ""
                      }`}
                      onClick={() => {
                        setProfilePic(pic);
                        setCustomPicUrl("");
                      }}
                    />
                  ))}
                </div>
                <div className="custom-avatar-url">
                  <label>Or paste custom image URL</label>
                  <input
                    type="url"
                    value={customPicUrl}
                    onChange={(e) => setCustomPicUrl(e.target.value)}
                    placeholder="https://example.com/your-image.jpg"
                  />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Profile"}
              </button>
            </form>
          ) : (
            <div className="profile-view-details">
              <div className="detail-section">
                <h3>Bio Description</h3>
                <p className="profile-bio-text">
                  {profile?.bio || "No bio written yet. Click 'Edit Profile' to write one!"}
                </p>
              </div>

              <div className="skills-view-row">
                <div className="skill-card teach">
                  <h4>Teaches</h4>
                  <p>{profile?.skills_offered?.join(", ") || "Not specified"}</p>
                </div>
                <div className="skill-card learn">
                  <h4>Wants to Learn</h4>
                  <p>{profile?.skills_wanted?.join(", ") || "Not specified"}</p>
                </div>
              </div>

              <div className="stats-strip">
                <div className="stat-item">
                  <span className="label">Available Credits</span>
                  <span className="value">🪙 {profile?.credit_points}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Swap Rating</span>
                  <span className="value">
                    ⭐ {profile?.rating ? parseFloat(profile.rating.toString()).toFixed(1) : "5.0"}
                  </span>
                </div>
              </div>

              <hr className="divider" />

              {/* Certificate Verification Section */}
              <div className="certificate-section">
                <h3>Certificate Verification 📄</h3>
                <p className="subtitle">
                  Build trust. Upload valid certificates to display verification tags on your match card.
                </p>

                {isVerified ? (
                  <div className="verified-certificate-card">
                    <span className="cert-icon">📜</span>
                    <div className="cert-info">
                      <h4>Verified Skill Certificate</h4>
                      <p className="filename">{certificateName}</p>
                    </div>
                    <span className="verified-pill">Verified</span>
                    <button
                      onClick={() => {
                        localStorage.removeItem("mock_certificate");
                        setIsVerified(false);
                        setCertificateName("");
                      }}
                      className="remove-cert-btn"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="upload-certificate-zone">
                    <label htmlFor="cert-upload" className="cert-upload-label">
                      <span className="upload-icon">📤</span>
                      <span>Upload certificate file (PDF, PNG, JPG)</span>
                      <span className="subtext">Max size 5MB</span>
                    </label>
                    <input
                      id="cert-upload"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleCertificateUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;