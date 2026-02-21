import { IOrderRepository } from '../../repositories/IOrderRepository';
import { Order } from '../../entities/Order';

export class GetOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async executeByNumber(orderNumber: string): Promise<Order | null> {
    return this.orderRepository.findByOrderNumber(orderNumber);
  }
}
