const Transaction = require("../models/Transaction");
const Service = require("../models/Service");
const Employee = require("../models/Employee");

// CREATE TRANSACTION (using names)
exports.createTransaction = async (req, res) => {
  try {
    const { employeeName, serviceName, saleAmount } = req.body;

    // Find employee
    const employee = await Employee.findOne({ name: employeeName });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Find service
    const service = await Service.findOne({ name: serviceName });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const costAmount = service.costAmount;

    if (typeof costAmount !== "number") {
      return res.status(400).json({
        message: "Service costAmount is missing or invalid"
      });
    }

    const profit = Number(saleAmount) - Number(costAmount);

    const transaction = new Transaction({
      employee: employee._id,
      service: service._id,
      saleAmount,
      costAmount,
      profit
    });

    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("employee", "name")
      .populate("service", "name costAmount");

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// EMPLOYEE-WISE SALES & PROFIT
exports.employeeSalesReport = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      {
        $group: {
          _id: "$employee",
          totalSales: { $sum: "$saleAmount" },
          totalProfit: { $sum: "$profit" },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employeeName: "$employee.name",
          totalSales: 1,
          totalProfit: 1,
          totalTransactions: 1
        }
      }
    ]);

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getMostProfitableServices = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      {
        $group: {
          _id: "$service",
          totalRevenue: { $sum: "$saleAmount" },
          totalCost: { $sum: "$costAmount" },
          totalProfit: { $sum: "$profit" },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $sort: { totalProfit: -1 }
      },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service"
        }
      },
      {
        $unwind: "$service"
      },
      {
        $project: {
          _id: 0,
          serviceName: "$service.name",
          totalRevenue: 1,
          totalCost: 1,
          totalProfit: 1,
          totalTransactions: 1
        }
      }
    ]);

    res.status(200).json({
      message: "Services are sorted from most profitable to least profitable",
      totalServices: report.length,
      data: report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfitByPeriod = async (req, res) => {
  try {
    const period = req.query.period || "weekly"; // weekly | monthly

    let groupStage = {};

    if (period === "weekly") {
      groupStage = {
        year: { $year: "$createdAt" },
        week: { $week: "$createdAt" }
      };
    } else if (period === "monthly") {
      groupStage = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      };
    } else {
      return res.status(400).json({
        message: "Invalid period. Use 'weekly' or 'monthly'."
      });
    }

    const report = await Transaction.aggregate([
      {
        $group: {
          _id: groupStage,
          totalRevenue: { $sum: "$saleAmount" },
          totalCost: { $sum: "$costAmount" },
          totalProfit: { $sum: "$profit" },
          totalTransactions: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1, "_id.month": 1 } }
    ]);

    res.status(200).json({
      message: `Profit report grouped by ${period}`,
      data: report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfitPercentagePerEmployee = async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      {
        $group: {
          _id: "$employee",
          totalSales: { $sum: "$saleAmount" },
          totalCost: { $sum: "$costAmount" },
          totalProfit: { $sum: "$profit" },
          totalTransactions: { $sum: 1 }
        }
      },
      {
        $addFields: {
          profitPercentage: {
            $cond: [
              { $eq: ["$totalSales", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$totalProfit", "$totalSales"] },
                  100
                ]
              }
            ]
          }
        }
      },
      { $sort: { profitPercentage: -1 } },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employeeName: "$employee.name",
          totalSales: 1,
          totalCost: 1,
          totalProfit: 1,
          profitPercentage: { $round: ["$profitPercentage", 2] },
          totalTransactions: 1
        }
      }
    ]);

    res.status(200).json({
      message: "Employees sorted by highest profit percentage",
      totalEmployees: report.length,
      data: report
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
