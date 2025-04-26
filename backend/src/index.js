import express from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello World! ");
});

// Server listening
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
