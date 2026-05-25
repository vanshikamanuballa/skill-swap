const express = require("express");
const router = express.Router();
const matchController = require("../controllers/matchController");
const auth = require("../middleware/auth");

router.get("/", auth, matchController.getMatches);
router.post("/connect", auth, matchController.connectUser);

module.exports = router;
