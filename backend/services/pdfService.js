const axios = require("axios");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");


const tempDir = path.join(__dirname, "../temp");

// Ensure temp folder exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

async function extractPdfText(pdfUrl) {
  try {
    const response = await axios.get(pdfUrl, {
  responseType: "arraybuffer",
  headers: {
    "User-Agent": "ResearchLens/1.0 (vedika1464@gmail.com)"
  }
});

    const filePath = path.join(tempDir, "temp.pdf");

    fs.writeFileSync(filePath, response.data);

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    fs.unlinkSync(filePath); // delete after reading

    return pdfData.text;

  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return null;
  }
}

module.exports = { extractPdfText };
