import { IOrderRepository } from '../../repositories/IOrderRepository';
import { CreateOrderDTO, Order } from '../../entities/Order';

export class CreateOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(orderData: CreateOrderDTO): Promise<Order> {
    // 1. Calculate line subtotals dynamically to ensure correctness
    const calculatedItems = orderData.items.map((item) => {
      // line_subtotal => (unit_price + modifier_totals) * quantity
      const modifierTotals = item.modifiers.reduce(
        (acc, mod) => acc + (mod.unit_price_delta || 0),
        0
      );
      const lineSubtotal = (item.unit_price + modifierTotals) * item.quantity;
      return {
        ...item,
        modifier_totals: modifierTotals,
        line_subtotal: lineSubtotal,
      };
    });

    // 2. Sum up subtotals
    const computedSubtotal = calculatedItems.reduce((acc, item) => acc + item.line_subtotal, 0);

    // 3. Optional: Verify calculated vs provided total to ensure consistency
    const providedTotal = orderData.money.total_amount;
    const expectedTotal =
      computedSubtotal +
      orderData.money.delivery_fee +
      orderData.money.tax_total +
      orderData.money.tips -
      orderData.money.discount;

    // Adjusting money payload to ensure precision
    const sanitizedMoney = {
      ...orderData.money,
      subtotal: computedSubtotal,
      total_amount: expectedTotal,
    };

    const sanitizedData: CreateOrderDTO = {
      ...orderData,
      money: sanitizedMoney,
      items: calculatedItems,
    };

    return this.orderRepository.create(sanitizedData);
  }
}
