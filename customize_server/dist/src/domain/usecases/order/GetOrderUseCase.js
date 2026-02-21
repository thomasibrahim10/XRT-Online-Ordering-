"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrderUseCase = void 0;
class GetOrderUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute(id) {
        return this.orderRepository.findById(id);
    }
    async executeByNumber(orderNumber) {
        return this.orderRepository.findByOrderNumber(orderNumber);
    }
}
exports.GetOrderUseCase = GetOrderUseCase;
