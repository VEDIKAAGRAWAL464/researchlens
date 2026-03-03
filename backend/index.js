require("dotenv").config();
const express = require("express");
const cors = require("cors");

const researchRoutes = require("./routes/researchRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", researchRoutes);

app.listen(5000, () => {
  console.log("ResearchLens backend running on port 5000");
});

const axios = require("axios");

async function warmModel() {
  try {
    await axios.post("http://localhost:11434/api/generate", {
      model: "phi3",
      prompt: "warm up",
      stream: false
    });
    console.log("LLM warmed up successfully");
  } catch (err) {
    console.log("LLM warm-up failed:", err.message);
  }
}

warmModel();