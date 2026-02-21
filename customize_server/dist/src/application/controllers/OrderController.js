"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const CreateOrderUseCase_1 = require("../../domain/usecases/order/CreateOrderUseCase");
const GetOrderUseCase_1 = require("../../domain/usecases/order/GetOrderUseCase");
const GetOrdersUseCase_1 = require("../../domain/usecases/order/GetOrdersUseCase");
const UpdateOrderStatusUseCase_1 = require("../../domain/usecases/order/UpdateOrderStatusUseCase");
const DeleteOrderUseCase_1 = require("../../domain/usecases/order/DeleteOrderUseCase");
const OrderRepository_1 = require("../../infrastructure/repositories/OrderRepository");
const response_1 = require("../../shared/utils/response");
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const AppError_1 = require("../../shared/errors/AppError");
class OrderController {
    constructor() {
        this.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            // In a real scenario, customer_id might come from req.user if customer is logging in
            const customer_id = req.user?.id || req.body.customer_id;
            if (!customer_id) {
                throw new AppError_1.ValidationError('customer_id is required');
            }
            const orderData = {
                ...req.body,
                customer_id,
            };
            const order = await this.createOrderUseCase.execute(orderData);
            return (0, response_1.sendSuccess)(res, 'Order created successfully', order, 201);
        });
        this.getAll = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const statusParam = req.query.status;
            const status = statusParam
                ? statusParam.includes(',')
                    ? statusParam.split(',').map((s) => s.trim()).filter(Boolean)
                    : statusParam
                : undefined;
            const filters = {
                status,
                order_type: req.query.order_type,
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
            };
            // If a customer is querying their own orders
            if (req.user?.role === 'customer') {
                filters.customer_id = req.user.id;
            }
            else if (req.query.customer_id) {
                filters.customer_id = req.query.customer_id;
            }
            const orders = await this.getOrdersUseCase.execute(filters);
            return (0, response_1.sendSuccess)(res, 'Orders retrieved successfully', orders);
        });
        this.getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const order = await this.getOrderUseCase.execute(id);
            if (!order) {
                throw new AppError_1.NotFoundError('Order not found');
            }
            // Optional: authorization check to ensure customer owns the order
            if (req.user?.role === 'customer' && order.customer_id !== req.user.id) {
                throw new AppError_1.NotFoundError('Order not found'); // Hide existence to unauthorized users
            }
            return (0, response_1.sendSuccess)(res, 'Order retrieved successfully', order);
        });
        this.updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { status, cancelled_reason, cancelled_by, ready_time, clear_schedule } = req.body;
            if (!status) {
                throw new AppError_1.ValidationError('Status is required');
            }
            const order = await this.updateOrderStatusUseCase.execute(id, {
                status,
                ready_time: ready_time ? new Date(ready_time) : undefined,
                clear_schedule: !!clear_schedule,
                cancelled_reason,
                cancelled_by: cancelled_by || req.user?.role || 'system',
            });
            if (!order) {
                throw new AppError_1.NotFoundError('Order not found');
            }
            return (0, response_1.sendSuccess)(res, 'Order status updated successfully', order);
        });
        this.delete = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const success = await this.deleteOrderUseCase.execute(id);
            if (!success) {
                throw new AppError_1.NotFoundError('Order not found or already deleted');
            }
            return (0, response_1.sendSuccess)(res, 'Order deleted successfully', { deleted: true });
        });
        const orderRepository = new OrderRepository_1.OrderRepository();
        this.createOrderUseCase = new CreateOrderUseCase_1.CreateOrderUseCase(orderRepository);
        this.getOrderUseCase = new GetOrderUseCase_1.GetOrderUseCase(orderRepository);
        this.getOrdersUseCase = new GetOrdersUseCase_1.GetOrdersUseCase(orderRepository);
        this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase_1.UpdateOrderStatusUseCase(orderRepository);
        this.deleteOrderUseCase = new DeleteOrderUseCase_1.DeleteOrderUseCase(orderRepository);
    }
}
exports.OrderController = OrderController;
