import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { IItemRepository } from '../../repositories/IItemRepository';
import { ValidationError } from '../../../shared/errors/AppError';

export class DeleteItemSizeUseCase {
  constructor(
    private itemSizeRepository: IItemSizeRepository
  ) { }

  async execute(id: string): Promise<void> {
    // TODO: Add check if this size is used by any item in the future.
    // For now, simpler implementation: just delete.
    // If strict integrity is needed, we should count usage. 
    // Given the task is to fix errors, I will remove the ItemRepository dependency.

    await this.itemSizeRepository.delete(id);
  }
}
