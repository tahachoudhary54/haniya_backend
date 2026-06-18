import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    // Total Orders
    const totalOrders = await Order.countDocuments();
    
    // Total Revenue (sum of totalPrice where status is not Cancelled)
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Total Products
    const totalProducts = await Product.countDocuments();

    // Active Partners
    const activePartners = await User.countDocuments({ role: { $ne: 'admin' }, isVerified: true });

    // Recent Orders (last 5)
    const recentOrders = await Order.find()
      .populate('user', 'companyName fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      activePartners,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
