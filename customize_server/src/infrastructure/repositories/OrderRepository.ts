import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import {
  Order,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
  OrderStatus,
  OrderItem,
  OrderItemModifier,
} from '../../domain/entities/Order';
import { OrderModel, OrderDocument } from '../database/models/OrderModel';
import { Types } from 'mongoose';

export class OrderRepository implements IOrderRepository {
  private mapToDomain(doc: OrderDocument): Order {
    const obj = doc.toObject();

    // Map items strictly to Domain entities
    const mappedItems: OrderItem[] = obj.items.map((item: any) => ({
      id: item._id.toString(),
      menu_item_id: item.menu_item_id.toString(),
      size_id: item.size_id ? item.size_id.toString() : undefined,
      name_snap: item.name_snap,
      size_snap: item.size_snap,
      unit_price: item.unit_price,
      quantity: item.quantity,
      modifier_totals: item.modifier_totals,
      line_subtotal: item.line_subtotal,
      special_notes: item.special_notes,
      modifiers: item.modifiers.map((mod: any) => ({
        id: mod._id.toString(),
        modifier_id: mod.modifier_id.toString(),
        name_snapshot: mod.name_snapshot,
        modifier_quantity_id: mod.modifier_quantity_id
          ? mod.modifier_quantity_id.toString()
          : undefined,
        quantity_label_snapshot: mod.quantity_label_snapshot,
        unit_price_delta: mod.unit_price_delta,
      })),
    }));

    return {
      id: obj._id.toString(),
      customer_id: obj.customer_id.toString(),
      order_number: obj.order_number,
      order_type: obj.order_type as any,
      service_time_type: obj.service_time_type as any,
      schedule_time: obj.schedule_time,
      ready_time: obj.ready_time,
      actual_ready_time: obj.actual_ready_time,
      status: obj.status as OrderStatus,
      created_at: obj.created_at,
      updated_at: obj.updated_at,
      cancelled_at: obj.cancelled_at,
      completed_at: obj.completed_at,
      cancelled_reason: obj.cancelled_reason,
      cancelled_by: obj.cancelled_by,
      money: obj.money,
      delivery: obj.delivery,
      notes: obj.notes,
      items: mappedItems,
    };
  }

  async create(orderData: CreateOrderDTO): Promise<Order> {
    // Generate order number (e.g., ORD-YYYYMMDD-XXXX)
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const doc = new OrderModel({
      ...orderData,
      order_number: orderNumber,
      status: 'pending',
    });

    const saved = await doc.save();
    return this.mapToDomain(saved);
  }

  async findById(id: string): Promise<Order | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await OrderModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ order_number: orderNumber }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  private static readonly SPECIAL_NEW = '__new__';
  private static readonly SPECIAL_INPROGRESS = '__inprogress__';
  private static readonly SPECIAL_SCHEDULED = '__scheduled__';

  private applyStatusFilter(query: any, status: string | string[]): void {
    const s = Array.isArray(status) ? status[0] : status;

    switch (s) {
      case OrderRepository.SPECIAL_NEW:
        query.status = 'pending';
        break;

      case OrderRepository.SPECIAL_INPROGRESS:
        query.status = { $in: ['accepted', 'inkitchen', 'ready', 'out of delivery'] };
        query.$or = [{ schedule_time: null }, { schedule_time: { $exists: false } }];
        break;

      case OrderRepository.SPECIAL_SCHEDULED:
        query.schedule_time = { $ne: null, $exists: true };
        query.status = {
          $in: ['accepted', 'inkitchen', 'ready', 'out of delivery'],
        };
        break;

      default:
        query.status = Array.isArray(status)
          ? { $in: status }
          : status;
        break;
    }
  }

  async findAll(filters: any): Promise<{ data: Order[]; total: number }> {
    const query: any = {};
    if (filters.status) {
      this.applyStatusFilter(query, filters.status);
    }
    if (filters.order_type) query.order_type = filters.order_type;

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      OrderModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      OrderModel.countDocuments(query).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapToDomain(doc)),
      total,
    };
  }

  async findByCustomerId(
    customerId: string,
    filters: any
  ): Promise<{ data: Order[]; total: number }> {
    if (!Types.ObjectId.isValid(customerId)) return { data: [], total: 0 };

    const query: any = { customer_id: customerId };
    if (filters.status) {
      this.applyStatusFilter(query, filters.status);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      OrderModel.find(query).sort({ created_at: -1 }).skip(skip).limit(limit).exec(),
      OrderModel.countDocuments(query).exec(),
    ]);

    return {
      data: docs.map((doc) => this.mapToDomain(doc)),
      total,
    };
  }

  async updateStatus(id: string, updateData: UpdateOrderStatusDTO): Promise<Order | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const updates: any = { status: updateData.status };
    const unsets: any = {};

    if (updateData.ready_time) {
      updates.ready_time = updateData.ready_time;
    }

    if (updateData.clear_schedule) {
      unsets.schedule_time = 1;
    }

    if (updateData.status === 'completed') {
      updates.completed_at = new Date();
    } else if (updateData.status === 'canceled') {
      updates.cancelled_at = new Date();
      if (updateData.cancelled_reason != null) updates.cancelled_reason = updateData.cancelled_reason;
      if (updateData.cancelled_by != null) updates.cancelled_by = updateData.cancelled_by;
    }

    const updateOp: any = { $set: updates };
    if (Object.keys(unsets).length > 0) {
      updateOp.$unset = unsets;
    }

    const doc = await OrderModel.findByIdAndUpdate(
      id,
      updateOp,
      { new: true, runValidators: true }
    ).exec();

    return doc ? this.mapToDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await OrderModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
