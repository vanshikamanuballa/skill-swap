const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected to Chat Socket:", socket.id);

    // Join private room between two users
    socket.on("join_chat", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) return;
      
      const u1 = Math.min(parseInt(senderId, 10), parseInt(receiverId, 10));
      const u2 = Math.max(parseInt(senderId, 10), parseInt(receiverId, 10));
      const roomName = `room_${u1}_${u2}`;
      
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined private room: ${roomName}`);
    });

    // Send and broadcast message
    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, message } = data;
        if (!senderId || !receiverId || !message) return;

        const sId = parseInt(senderId, 10);
        const rId = parseInt(receiverId, 10);

        // Persist message to DB via Model
        const savedMsg = await Message.create(sId, rId, message);

        // Broadcast to private room
        const u1 = Math.min(sId, rId);
        const u2 = Math.max(sId, rId);
        const roomName = `room_${u1}_${u2}`;

        io.to(roomName).emit("receive_message", savedMsg);
        console.log(`Real-time message saved and broadcasted to ${roomName}`);

      } catch (err) {
        console.error("Socket send_message error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};
