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
