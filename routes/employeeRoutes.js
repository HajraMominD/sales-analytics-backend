const express = require("express");
const router = express.Router();

const {
  addEmployee,
  getEmployees
} = require("../controllers/employeeController");

router.post("/", addEmployee);
router.get("/", getEmployees);

module.exports = router;
