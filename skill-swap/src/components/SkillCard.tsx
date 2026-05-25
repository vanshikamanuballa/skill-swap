import React from "react";

interface SkillCardProps {
  name: string;
  type: "offer" | "want";
}

export const SkillCard: React.FC<SkillCardProps> = ({ name, type }) => {
  return (
    <span className={`skill-badge-item ${type}`}>
      {type === "offer" ? "🎓 " : "🎯 "}
      {name}
    </span>
  );
};

export default SkillCard;
