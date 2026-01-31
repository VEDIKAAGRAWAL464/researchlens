const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const url = `http://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=5`;
    const response = await axios.get(url);
    res.send(response.data);
  } catch {
    res.status(500).send("Error fetching papers");
  }
});

app.listen(5000, () => {
  console.log("ResearchLens backend running");
});
