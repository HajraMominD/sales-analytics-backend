const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    costAmount: {       // Cost to company for this service
      type: Number,
      required: true
    },
    saleAmount: {       // Default sale amount (optional)
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Service", serviceSchema);
