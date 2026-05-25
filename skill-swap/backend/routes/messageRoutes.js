const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const auth = require("../middleware/auth");

router.get("/connections", auth, messageController.getConnections);
router.get("/:id", auth, messageController.getMessages);
router.post("/send", auth, messageController.sendMessage);

module.exports = router;
