require("dotenv").config();
const express = require("express");
const cors = require("cors");

const researchRoutes = require("./routes/researchRoutes");

const app = express();

// ── CORS ───────────────────────────────────────────────────────
app.use(cors({
  origin: "http://127.0.0.1:5500",  // VS Code Live Server frontend URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ── Middleware ─────────────────────────────────────────────────
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.use("/api", researchRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "ResearchLens API is running" });
});

// ── Start Server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ResearchLens backend running on port ${PORT}`);
});