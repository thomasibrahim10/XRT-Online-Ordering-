"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrdersUseCase = void 0;
class GetOrdersUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }
    async execute(filters) {
        if (filters.customer_id) {
            return this.orderRepository.findByCustomerId(filters.customer_id, filters);
        }
        return this.orderRepository.findAll(filters);
    }
}
exports.GetOrdersUseCase = GetOrdersUseCase;
