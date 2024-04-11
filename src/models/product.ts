// src/models/products.ts
import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new mongoose.Schema({
  Ref: {
    type: String,
    required: true,
    unique: true,
  },
  Designation: {
    type: String,
    required: true,
  },
  Price: {
    type: String,
    required: true,
  },
  Stock: {
    type: String,
    required: true,
  },
  Image: {
    type: String, 
    required: true,
  },
  Brand: {
    type: String,
    required: true,
  },
  Company: {
    type: String,
    required: true,
  },
  Link: {
    type: String,
    required: true,
    unique: true,
  },
  DateMiseAJour : {
    type: Date,
    required : true,
  },
});


export default mongoose.model('product', productSchema);
