"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const CategoryModel_1 = require("../database/models/CategoryModel");
class CategoryRepository {
    toDomain(document) {
        return {
            id: document._id.toString(),
            business_id: document.business_id,
            name: document.name,
            description: document.description,
            kitchen_section_id: document.kitchen_section_id
                ? typeof document.kitchen_section_id === 'object'
                    ? document.kitchen_section_id._id.toString()
                    : document.kitchen_section_id.toString()
                : undefined,
            kitchen_section_data: document.kitchen_section_id && typeof document.kitchen_section_id === 'object'
                ? {
                    id: document.kitchen_section_id._id.toString(),
                    name: document.kitchen_section_id.name,
                }
                : undefined,
            sort_order: document.sort_order,
            is_active: document.is_active,
            image: document.image,
            image_public_id: document.image_public_id,
            icon: document.icon,
            icon_public_id: document.icon_public_id,
            translated_languages: document.translated_languages,
            modifier_groups: document.modifier_groups
                ? document.modifier_groups.map((mg) => ({
                    modifier_group_id: typeof mg.modifier_group_id === 'string'
                        ? mg.modifier_group_id
                        : (mg.modifier_group_id?._id || mg.modifier_group_id).toString(),
                    modifier_group: mg.modifier_group_id && typeof mg.modifier_group_id === 'object'
                        ? { name: mg.modifier_group_id.name }
                        : undefined,
                    display_order: mg.display_order || 0,
                    modifier_overrides: mg.modifier_overrides
                        ? mg.modifier_overrides.map((mo) => ({
                            modifier_id: typeof mo.modifier_id === 'string'
                                ? mo.modifier_id
                                : (mo.modifier_id?._id || mo.modifier_id).toString(),
                            max_quantity: mo.max_quantity,
                            is_default: mo.is_default,
                            prices_by_size: mo.prices_by_size || undefined,
                            quantity_levels: mo.quantity_levels || undefined,
                        }))
                        : undefined,
                }))
                : [],
            created_at: document.created_at,
            updated_at: document.updated_at,
        };
    }
    async create(categoryData) {
        const categoryDoc = new CategoryModel_1.CategoryModel(categoryData);
        await categoryDoc.save();
        return this.toDomain(categoryDoc);
    }
    async findById(id, business_id) {
        const query = { _id: id };
        // In single-tenant mode, we ignore business_id filter for ID lookups
        // if (business_id) {
        //   query.business_id = business_id;
        // }
        const categoryDoc = await CategoryModel_1.CategoryModel.findOne(query)
            .populate('kitchen_section_id')
            .populate('modifier_groups.modifier_group_id');
        return categoryDoc ? this.toDomain(categoryDoc) : null;
    }
    async findAll(filters) {
        const query = {};
        // Only filter by business_id if provided (for super admins, this might be undefined)
        // if (filters.business_id) {
        //   query.business_id = filters.business_id;
        // }
        if (filters.is_active !== undefined) {
            query.is_active = filters.is_active;
        }
        if (filters.kitchen_section_id) {
            query.kitchen_section_id = filters.kitchen_section_id;
        }
        const categoryDocs = await CategoryModel_1.CategoryModel.find(query)
            .populate('kitchen_section_id')
            .populate('modifier_groups.modifier_group_id')
            .sort({ sort_order: 1 });
        // Fetch product counts for these categories
        const categoryIds = categoryDocs.map((doc) => doc._id);
        const itemCounts = await Promise.resolve().then(() => __importStar(require('../database/models/ItemModel'))).then(({ ItemModel }) => ItemModel.aggregate([
            {
                $match: {
                    category_id: { $in: categoryIds },
                    is_active: true,
                },
            },
            {
                $group: {
                    _id: '$category_id',
                    count: { $sum: 1 },
                },
            },
        ]));
        const countMap = new Map(itemCounts.map((c) => [c._id.toString(), c.count]));
        return categoryDocs.map((doc) => {
            const category = this.toDomain(doc);
            category.products_count = countMap.get(doc._id.toString()) || 0;
            return category;
        });
    }
    async update(id, business_id, categoryData) {
        // Remove business_id from update filter
        const categoryDoc = await CategoryModel_1.CategoryModel.findOneAndUpdate({ _id: id }, categoryData, {
            new: true,
            runValidators: true,
        });
        if (!categoryDoc) {
            throw new Error('Category not found');
        }
        return this.toDomain(categoryDoc);
    }
    async delete(id, business_id) {
        // Remove business_id from delete filter
        await CategoryModel_1.CategoryModel.findOneAndDelete({ _id: id });
    }
    async exists(name, business_id) {
        const count = await CategoryModel_1.CategoryModel.countDocuments({
            name,
            business_id,
        });
        return count > 0;
    }
    async updateSortOrder(items) {
        if (!items || items.length === 0)
            return;
        const operations = items.map((item) => ({
            updateOne: {
                filter: { _id: item.id },
                update: { sort_order: item.order },
            },
        }));
        await CategoryModel_1.CategoryModel.bulkWrite(operations);
    }
}
exports.CategoryRepository = CategoryRepository;
