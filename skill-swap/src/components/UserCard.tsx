import React from "react";
import SkillCard from "./SkillCard";

export interface UserCardProps {
  id: number;
  name: string;
  teach_skill: string;
  learn_skill: string;
  bio: string;
  profile_pic: string;
  badge: string;
  rating: number | string;
  matchPercentage?: number;
  onConnect: (id: number, name: string) => void;
  isConnecting?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  teach_skill,
  learn_skill,
  bio,
  profile_pic,
  badge,
  rating,
  matchPercentage,
  onConnect,
  isConnecting = false
}) => {
  return (
    <div className="glass-card user-card">
      {matchPercentage !== undefined && (
        <div className="match-percentage-badge">
          ✨ {matchPercentage}% Match
        </div>
      )}

      <img 
        src={profile_pic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} 
        alt={name} 
        className="card-avatar"
      />

      <h3 className="card-name">{name}</h3>

      <span className={`badge-tag ${badge ? badge.toLowerCase() : "learner"}`}>
        {badge || "LEARNER"}
      </span>

      <div style={{ display: "flex", gap: "2px", justifyContent: "center", color: "var(--rating-color)", fontSize: "14px", marginBottom: "14px" }}>
        {"★".repeat(Math.round(Number(rating || 5)))}
        {"☆".repeat(5 - Math.round(Number(rating || 5)))}
        <span style={{ color: "var(--text-muted)", marginLeft: "4px", fontSize: "12px", fontWeight: "600" }}>({rating})</span>
      </div>

      <p className="card-bio">{bio || "Ready to exchange skills and learn something new!"}</p>

      <div className="skills-section">
        <div>
          <h4 className="skill-lbl">Teaches</h4>
          <div className="skill-tags-list">
            {teach_skill ? (
              teach_skill.split(",").map((s, idx) => (
                <SkillCard key={idx} name={s.trim()} type="offer" />
              ))
            ) : (
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No skills listed</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="skill-lbl">Wants to Learn</h4>
          <div className="skill-tags-list">
            {learn_skill ? (
              learn_skill.split(",").map((s, idx) => (
                <SkillCard key={idx} name={s.trim()} type="want" />
              ))
            ) : (
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>No skills listed</span>
            )}
          </div>
        </div>
      </div>

      <div className="card-footer">
        <button 
          onClick={() => onConnect(id, name)} 
          className="btn-primary card-btn"
          disabled={isConnecting}
        >
          {isConnecting ? (
            <div className="spinner"></div>
          ) : (
            "Connect & Chat"
          )}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
