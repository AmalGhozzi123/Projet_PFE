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
  Designation: String,
  Price: String,
  Stock: String,
  Image: String,
  Brand: String,
  Company: String,
  Link: String,
});

const Product = mongoose.model("Product", productSchema);

const competitorSchema = new mongoose.Schema({
  Logo: {
    type: String,
    required: true,
 
  },
  Name: {
    type: String,
    required: true,
  
  },
  Link: {
    type: String,
    required: true,
   
  },
});

const Competitor = mongoose.model("Competitor", competitorSchema);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





app.get("/api/products-by-reference/:reference", async (req, res) => {
  try {
    const { reference } = req.params;
    const products = await Product.find({ Ref: reference });
    if (products.length === 0) {
      res.status(404).json({ message: "Aucun produit trouvé pour la référence spécifiée." });
    } else {
      res.json(products);
    }
  } catch (error) {
    console.error("Error fetching products by reference:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/competitors", async (req, res) => {
  try {
    const competitors = await Competitor.find();
    res.json(competitors);
  } catch (error) {
    console.error("Error fetching competitors:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/competitors", async (req, res) => {
  try {
    const { Logo, Name, Link } = req.body;
    const competitor = new Competitor({ Logo, Name, Link });
    const savedCompetitor = await competitor.save();
    res.status(201).json(savedCompetitor);
  } catch (error) {
    console.error("Error adding competitor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.delete("/api/competitors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Competitor.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting competitor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.put("/api/competitors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Logo, Name, Link } = req.body;
    const updatedCompetitor = await Competitor.findByIdAndUpdate(id, { Logo, Name, Link }, { new: true });
    res.json(updatedCompetitor);
  } catch (error) {
    console.error("Error updating competitor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});