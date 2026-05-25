const Message = require("../models/Message");
const Match = require("../models/Match");

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    if (!targetId) {
      return res.status(400).json({ message: "Target ID required" });
    }

    const messages = await Message.getHistory(userId, targetId);
    res.status(200).json(messages);
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, text } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "Receiver ID and text required" });
    }

    // Auto connect users if they send a message
    await Match.connect(senderId, receiverId);

    const message = await Message.create(senderId, receiverId, text);
    res.status(201).json(message);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
};

exports.getConnections = async (req, res) => {
  try {
    const userId = req.user.id;
    const connections = await Match.getConnections(userId);
    res.status(200).json(connections);
  } catch (error) {
    console.error("getConnections error:", error);
    res.status(500).json({ message: "Server error fetching connections" });
  }
};
