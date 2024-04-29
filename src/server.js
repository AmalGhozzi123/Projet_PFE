const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // Ensure JSON bodies are parsed

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));

// Email transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Product Schema
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

// Competitor Schema
const competitorSchema = new mongoose.Schema({
  Logo: { type: String, required: true },
  Name: { type: String, required: true },
  Link: { type: String, required: true },
});
const Competitor = mongoose.model("Competitor", competitorSchema);



// Products API
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

// Competitors API
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


// User Schema
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) { return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v); },
      message: props => `${props.value} n'est pas un email valide!`
    }
  },
  adresse: { type: String, required: true },
  motDePasse: { type: String, required: true },
  Tel: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date
});
// Registration and Login API
userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

const User = mongoose.model('User', userSchema);

app.post("/api/register", async (req, res) => {
  try {
    const { nom, prenom, email, adresse, motDePasse, Tel, verificationMotDePasse } = req.body;
    if (!nom || !prenom || !email || !adresse || !motDePasse || !Tel) {
      return res.status(400).send("Veuillez remplir tous les champs.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("Email déjà utilisé.");
    }

    if (motDePasse !== verificationMotDePasse) {
      return res.status(400).send("Les mots de passe ne correspondent pas.");
    }

    // Validation d'email simple, peut être améliorée avec une regex ou un package de validation d'email
    if (!email.includes('@')) {
      return res.status(400).send("Adresse email invalide.");
    }

    // Validation de la longueur du numéro de téléphone
    if (Tel.length !== 8) {
      return res.status(400).send("Numéro de téléphone invalide.");
    }

    const emailVerificationToken = crypto.randomBytes(16).toString('hex');
    const confirmLink = `${process.env.SERVER_URL}/api/confirm-email?token=${emailVerificationToken}&confirm=yes`;
    const rejectLink = `${process.env.SERVER_URL}/api/confirm-email?token=${emailVerificationToken}&confirm=no`;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Interise.io | Confirmation de création de compte',
      html: `<html>
      <head>
      <style>
        .button {
          color:black;
          display: inline-block;
          padding: 10px 20px;
          margin: 10px;
          font-size: 16px;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          outline: none;
          color: #fff;
          background-color: #4CAF50;
          border: none;
          border-radius: 15px;
          box-shadow: 0 9px #999;
        }
      
        .button:hover {background-color: #3e8e41}
      
        .button:active {
          background-color: #3e8e41;
          box-shadow: 0 5px #666;
          transform: translateY(4px);
        }
      
        .button-red {
          background-color: #f44336;
        }
      
        .button-red:hover {background-color: #da190b}
      
        .button-red:active {
          background-color: #da190b;
          box-shadow: 0 5px #666;
          transform: translateY(4px);
        }
      </style>
      </head>
      <body>
        <h1>Interise.io | Confirmez votre compte</h1>
        <h3>Bonjour ${email} ,</h3>
        <p>Êtes-vous celui qui veut créer un compte?</p>
        <a href="${confirmLink}" class="button" style="color:black">Oui</a>
        <a href="${rejectLink}" class="button button-red" style="color:black">Non</a>
      </body>
      </html>
      `
    };

    const user = new User({ nom, prenom, email, adresse, motDePasse, Tel, isEmailVerified: false, emailVerificationToken, emailVerificationTokenExpires: Date.now() + 3600000 });
    await user.save();
    await transporter.sendMail(mailOptions);

    res.status(200).send("Veuillez vérifier votre email pour confirmer la création de compte.");
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    res.status(500).send("Erreur lors de l'inscription : " + error.message);
  }
});


app.get('/api/confirm-email', async (req, res) => {
  try {
    const { token, confirm } = req.query;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send(`<html><body><h1>Link Invalid</h1><p>This token is either invalid or has expired.</p><a href="${process.env.CLIENT_URL}">Return Home</a></body></html>`);
    }

    if (confirm === 'yes') {
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationTokenExpires = undefined;
      await user.save();
      res.send(`<html><body><h1>Account Confirmed</h1><p>Thank you for confirming. Your account has been created.</p><a href="${process.env.CLIENT_URL}">Go to Login</a></body></html>`);
    } else {
      await User.deleteOne({ _id: user._id });
      res.send(`<html><body><h1>Account Creation Declined</h1><p>You have declined to create an account.</p><a href="${process.env.CLIENT_URL}">Return Home</a></body></html>`);
    }
  } catch (error) {
    console.error("Email confirmation error:", error);
    res.status(500).send(`<html><body><h1>Error</h1><p>Error processing your request: ${error.message}</p><a href="${process.env.CLIENT_URL}">Return Home</a></body></html>`);
  }
});


app.post("/api/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.findOne({ email, isEmailVerified: true });
    if (!user) {
      return res.status(401).send("Either the email has not been verified or it does not exist.");
    }

    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).send("Invalid login credentials.");
    }

    res.send("Logged in successfully.");
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Error logging in: " + error.message);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
