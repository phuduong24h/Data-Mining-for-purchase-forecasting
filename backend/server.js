const express = require("express");
const cors = require("cors"); // 👈 import cors
const bodyParser = require("body-parser");
const { processData, getSuggestions } = require("./processData");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/api/fpgrowth", async (req, res) => {
  try {
    await processData();
    res.status(200).json({ message: "FP-Growth executed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra khi xử lý dữ liệu." });
  }
});

app.post("/api/suggest", async (req, res) => {
  console.log("Received body: ", req.body);
  const selectedItems = req.body.selectedItems;
  try {
    const suggestions = await getSuggestions(selectedItems);
    res.json(suggestions);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi xử lý yêu cầu." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
