// src/models/products.ts
import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
  Ref: {
    type: String,
    required: true,
    unique: true,
  },
  Link: {
    type: String,
    required: true,
    unique: true,
  },
  Price: {
    type: String,
    required: true,
    unique: true,
  },
  Brand: {
    type: String,
    required: true,
    unique: true,
  },
  Stock: {
    type: String,
    required: true,
    unique: true,
  },
  Image: {
    type: String,
    required: true,
    unique: true,
  },
  Designation: {
    type: String,
    required: true,
    unique: true,
  },
});

export default mongoose.model('product', productSchema);
