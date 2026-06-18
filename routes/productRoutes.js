import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// GET all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET single product by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST create product (Admin)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;
    const product = new Product({
      name,
      description,
      price,
      stock,
      category,
      image
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// PUT update product (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name;
      product.description = description;
      product.price = price;
      product.stock = stock;
      product.category = category;
      product.image = image;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// DELETE product (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;
