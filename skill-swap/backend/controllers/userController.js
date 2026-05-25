const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAllExcept(req.user.id);
    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    // Allow fetching "me" via a special string
    const id = userId === "me" ? req.user.id : parseInt(userId, 10);
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, skillsOffered, skillsWanted, bio, profilePic } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    let badge = "LEARNER";
    if (skillsOffered && skillsOffered.length > 0) {
      badge = "VERIFIED";
      if (bio && bio.toLowerCase().includes("certified")) {
        badge = "PRO";
      }
      if (bio && bio.toLowerCase().includes("expert")) {
        badge = "EXPERT";
      }
    }

    const updatedUser = await User.update(userId, {
      name,
      skillsOffered,
      skillsWanted,
      bio,
      profilePic,
      badge
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};
