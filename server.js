const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();



const employeeRoutes = require("./routes/employeeRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/employees", employeeRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/transactions", transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
