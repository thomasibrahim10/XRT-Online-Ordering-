import { IItemSizeRepository } from '../../repositories/IItemSizeRepository';
import { ItemSize } from '../../entities/ItemSize';

export class GetItemSizeUseCase {
  constructor(private itemSizeRepository: IItemSizeRepository) { }

  async execute(id: string): Promise<ItemSize | null> {
    return await this.itemSizeRepository.findById(id);
  }
}
