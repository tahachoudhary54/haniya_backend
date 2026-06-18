import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Please enter category for this product'],
  },
  image: {
    type: String,
    required: [true, 'Please upload an image for the product']
  }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
