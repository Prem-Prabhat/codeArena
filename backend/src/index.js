import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";


dotenv.config();


const app = express();


app.use(express.json());


app.get("/", (req, res) => {
  res.send("Hello guys welcome to the codeArena 🔥");
});

app.use("/api/v1/auth", authRoutes );


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
