import { IOrderRepository } from '../../repositories/IOrderRepository';

export class DeleteOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.orderRepository.delete(id);
  }
}
