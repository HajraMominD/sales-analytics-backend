const express = require("express");
const router = express.Router();
const { addService, getServices } = require("../controllers/serviceController");

// Routes
router.post("/", addService);
router.get("/", getServices);

module.exports = router;
