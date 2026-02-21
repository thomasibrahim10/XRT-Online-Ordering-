"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ItemController_1 = require("../controllers/ItemController");
const auth_1 = require("../middlewares/auth");
const authorize_1 = require("../middlewares/authorize");
const upload_1 = require("../middlewares/upload");
const logger_1 = require("../../shared/utils/logger");
const router = (0, express_1.Router)();
const itemController = new ItemController_1.ItemController();
const logUpload = (method) => (req, res, next) => {
    logger_1.logger.info('Upload request:', method, '/items');
    next();
};
// All item routes require authentication
router.use(auth_1.requireAuth);
// Sort order update - specific route before generic /:id routes
router.post('/sort-order', auth_1.requireAuth, itemController.updateSortOrder);
// Export items - requires items:read permission
router.get('/export', (0, authorize_1.requirePermission)('items:read'), itemController.exportItems);
// Get all items - requires items:read permission
router.get('/', (0, authorize_1.requirePermission)('items:read'), itemController.getAll);
// Get single item - requires items:read permission
router.get('/:id', (0, authorize_1.requirePermission)('items:read'), itemController.getById);
// Create item - requires items:create permission
router.post('/', (0, authorize_1.requirePermission)('items:create'), logUpload('POST'), upload_1.uploadImage.fields([{ name: 'image', maxCount: 1 }]), (req, res, next) => {
    logger_1.logger.info('Multer done for POST /items, hasFiles:', !!(req.files && req.files.image?.length));
    next();
}, itemController.create);
// Update item - requires items:update permission
router.put('/:id', (0, authorize_1.requirePermission)('items:update'), logUpload('PUT'), upload_1.uploadImage.fields([{ name: 'image', maxCount: 1 }]), (req, res, next) => {
    logger_1.logger.info('Multer done for PUT /items, hasFiles:', !!(req.files && req.files.image?.length));
    next();
}, itemController.update);
// Delete item - requires items:delete permission
router.delete('/:id', (0, authorize_1.requirePermission)('items:delete'), itemController.delete);
// Sort order update - specific route before generic /:id routes
router.post('/sort-order', auth_1.requireAuth, itemController.updateSortOrder);
// Get all items - requires items:read permission
exports.default = router;
