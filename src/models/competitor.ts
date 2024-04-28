import mongoose from 'mongoose';
const { Schema } = mongoose;

const competitorSchema = new Schema({
  competitorId: {
    type: String,
    required: true,
  },
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

export default mongoose.model('competitor', competitorSchema);
