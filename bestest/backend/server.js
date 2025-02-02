// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize Express app
const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for cross-origin requests

// MongoDB connection
const mongoURI = "mongodb://localhost:27017/expenseTracker"; // Replace with your MongoDB URI
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose schemas and models
const incomeSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  source: { type: String, required: true },
  date: { type: String, required: true },
});

const expenseSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
});

const savingsSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: String, required: true },
});

const Income = mongoose.model("Income", incomeSchema);
const Expense = mongoose.model("Expense", expenseSchema);
const Savings = mongoose.model("Savings", savingsSchema);

// API Endpoints

// Add Income
app.post("/api/income", async (req, res) => {
  try {
    const { amount, source, date } = req.body;
    const newIncome = new Income({ amount, source, date });
    await newIncome.save();
    res.status(201).json({ message: "Income added successfully!", data: newIncome });
  } catch (error) {
    res.status(500).json({ message: "Error adding income", error: error.message });
  }
});

// Add Expense
app.post("/api/expense", async (req, res) => {
  try {
    const { amount, type, date } = req.body;
    const newExpense = new Expense({ amount, type, date });
    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully!", data: newExpense });
  } catch (error) {
    res.status(500).json({ message: "Error adding expense", error: error.message });
  }
});

// Add Savings
app.post("/api/savings", async (req, res) => {
  try {
    const { amount, date } = req.body;
    const newSavings = new Savings({ amount, date });
    await newSavings.save();
    res.status(201).json({ message: "Savings added successfully!", data: newSavings });
  } catch (error) {
    res.status(500).json({ message: "Error adding savings", error: error.message });
  }
});

// Get All Data
app.get("/api/data", async (req, res) => {
  try {
    const incomes = await Income.find();
    const expenses = await Expense.find();
    const savings = await Savings.find();
    res.status(200).json({ incomes, expenses, savings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
});

// Delete Income
app.delete("/api/income/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Income.findByIdAndDelete(id);
    res.status(200).json({ message: "Income deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting income", error: error.message });
  }
});

// Delete Expense
app.delete("/api/expense/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.findByIdAndDelete(id);
    res.status(200).json({ message: "Expense deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
});

// Delete Savings
app.delete("/api/savings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Savings.findByIdAndDelete(id);
    res.status(200).json({ message: "Savings deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting savings", error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});