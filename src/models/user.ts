// src/models/user.ts
import mongoose from 'mongoose';
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
        validator: function(v: string) { // Ajouter : string pour définir le type de 'v'
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (props: { value: string }) => `${props.value} n'est pas un email valide!` // Ajouter type pour 'props'
      }
      
  },
  adresse: {
    type: String, 
    required: true,
  },
  motDePasse: {
    type: String,
    required: true,
  },
  Tel: {
    type: String,
    required: true,
  },
});

// Middleware pour hasher le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
  next();
});

export default mongoose.model('User', userSchema);
