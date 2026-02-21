import { IOrderRepository } from '../../repositories/IOrderRepository';
import { Order, UpdateOrderStatusDTO } from '../../entities/Order';
import { NotFoundError } from '../../../shared/errors/AppError';

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(id: string, updateData: UpdateOrderStatusDTO): Promise<Order | null> {
    const existing = await this.orderRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Order');
    }

    // Status transition validation can be injected here
    // e.g. prevents jumping from 'pending' directly to 'completed' without accepted

    return this.orderRepository.updateStatus(id, updateData);
  }
}
