const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Connected to MongoDB");
});

const productSchema = new mongoose.Schema({
  Ref: String,
  Link: String,
  Price: String,
  Brand: String,
  Stock: String,
  Image: String,
  Designation: String,
});

const Product = mongoose.model("Product", productSchema);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/products", async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      sort_by = 'add_date',
      sort_order = 'desc',
      // other query parameters...
    } = req.query;

    const skip = (page - 1) * pageSize;

    const products = await Product.find()
      .skip(skip)
      .limit(parseInt(pageSize))
      .sort({ [sort_by]: sort_order });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
