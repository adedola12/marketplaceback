import mongoose from "mongoose"

// Before Production remove the product page;
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1 },
  email: { type: String, required: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  comment: { type: String, required: true, trim: true },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;