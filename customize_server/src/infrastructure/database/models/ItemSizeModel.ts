import mongoose, { Schema, Document } from 'mongoose';
import { ItemSize } from '../../../domain/entities/ItemSize';

export interface ItemSizeDocument extends Omit<ItemSize, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const ItemSizeSchema = new Schema<ItemSizeDocument>(
  {
    business_id: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    display_order: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    deleted_at: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Unique constraint: code must be unique per business
ItemSizeSchema.index({ business_id: 1, code: 1 }, { unique: true });

export const ItemSizeModel = mongoose.model<ItemSizeDocument>('ItemSize', ItemSizeSchema);
