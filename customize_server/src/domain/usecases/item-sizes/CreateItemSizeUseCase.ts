import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { IItemRepository } from '../../repositories/IItemRepository';
import { ItemSize, CreateItemSizeDTO } from '../../entities/ItemSize';
import { ValidationError } from '../../../shared/errors/AppError';

export class CreateItemSizeUseCase {
  constructor(
    private itemSizeRepository: IItemSizeRepository
  ) { }

  async execute(sizeData: CreateItemSizeDTO): Promise<ItemSize> {
    // Check if code already exists for this business
    const codeExists = await this.itemSizeRepository.exists(sizeData.code, sizeData.business_id);
    if (codeExists) {
      throw new ValidationError(`Size code '${sizeData.code}' already exists`);
    }

    const finalSizeData: CreateItemSizeDTO = {
      ...sizeData,
      display_order: sizeData.display_order ?? 0,
      is_active: sizeData.is_active ?? true,
    };

    return await this.itemSizeRepository.create(finalSizeData);
  }
}
