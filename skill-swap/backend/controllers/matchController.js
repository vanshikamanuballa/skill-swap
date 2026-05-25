const User = require("../models/User");

exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all other users
    const otherUsers = await User.findAllExcept(userId);

    const myLearn = (currentUser.skills_wanted || []).map(s => s.toLowerCase().trim());
    const myTeach = (currentUser.skills_offered || []).map(s => s.toLowerCase().trim());

    // Compute matches
    const matches = otherUsers.map(other => {
      let matchScore = 50; // Base score
      
      const otherTeach = (other.skills_offered || []).map(s => s.toLowerCase().trim());
      const otherLearn = (other.skills_wanted || []).map(s => s.toLowerCase().trim());

      const overlapLearn = myLearn.filter(skill => otherTeach.includes(skill)).length;
      const overlapTeach = myTeach.filter(skill => otherLearn.includes(skill)).length;

      if (overlapLearn > 0) {
        matchScore += 20 * overlapLearn; // They teach what I want
      }
      if (overlapTeach > 0) {
        matchScore += 20 * overlapTeach; // I teach what they want
      }

      if (matchScore > 98) matchScore = 98;

      return {
        ...other,
        matchingSkills: [...new Set([...(other.skills_offered || []), ...(other.skills_wanted || [])])],
        matchPercentage: matchScore
      };
    });

    // Sort by match percentage desc
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json(matches);
  } catch (error) {
    console.error("getMatches error:", error);
    res.status(500).json({ message: "Server error fetching matches" });
  }
};

const Match = require("../models/Match");
exports.connectUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetId } = req.body;

    if (!targetId) {
      return res.status(400).json({ message: "Target user ID required" });
    }

    await Match.connect(userId, targetId);
    res.status(200).json({ message: "Connected successfully!" });
  } catch (error) {
    console.error("connectUser error:", error);
    res.status(500).json({ message: "Server error connecting users" });
  }
};
