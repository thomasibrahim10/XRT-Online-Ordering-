import express from 'express';
import {
  createCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  addRewards,
  redeemRewards,
  getCustomersByBusiness,
  getCustomersByLocation,
  getTopCustomersByRewards,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Basic CRUD routes
router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/top-rewards', getTopCustomersByRewards);
router.get('/business/:businessId', getCustomersByBusiness);
router.get('/location/:locationId', getCustomersByLocation);
router.get('/:id', getCustomer);
router.patch('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Rewards management routes
router.patch('/:id/rewards/add', addRewards);
router.patch('/:id/rewards/redeem', redeemRewards);

export default router;
