"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderController_1 = require("../controllers/OrderController");
const router = (0, express_1.Router)();
const orderController = new OrderController_1.OrderController();
// Optional: You can enforce `requireAuth` for all routes securely
// router.use(requireAuth);
// Create order - requires orders:create permission or customer role
router.post('/', 
// requireAuth,
// requirePermission('orders:create'),
orderController.create);
// Get all orders - requires orders:read permission
router.get('/', 
// requireAuth,
// requirePermission('orders:read'),
orderController.getAll);
// Get single order
router.get('/:id', 
// requireAuth,
// requirePermission('orders:read'),
orderController.getById);
// Update order status - requires orders:update permission
router.put('/:id/status', 
// requireAuth,
// requirePermission('orders:update'),
orderController.updateStatus);
// Delete order - requires orders:delete permission
router.delete('/:id', 
// requireAuth,
// requirePermission('orders:delete'),
orderController.delete);
exports.default = router;
