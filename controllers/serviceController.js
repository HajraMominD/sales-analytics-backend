const Service = require("../models/Service");

// Add new service
const addService = async (req, res) => {
  try {
    const { name, costAmount, saleAmount } = req.body;

    if (!name || costAmount === undefined) {
      return res.status(400).json({ message: "Service name and costAmount are required" });
    }

    const service = new Service({ name, costAmount, saleAmount });
    await service.save();

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all services
const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addService, getServices };
