"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderStatusUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
class UpdateOrderStatusUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute(id, updateData) {
        const existing = await this.orderRepository.findById(id);
        if (!existing) {
            throw new AppError_1.NotFoundError('Order');
        }
        // Status transition validation can be injected here
        // e.g. prevents jumping from 'pending' directly to 'completed' without accepted
        return this.orderRepository.updateStatus(id, updateData);
    }
}
exports.UpdateOrderStatusUseCase = UpdateOrderStatusUseCase;
