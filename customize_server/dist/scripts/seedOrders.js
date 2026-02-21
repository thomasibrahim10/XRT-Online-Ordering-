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
require("dotenv/config");
const connection_1 = require("../src/infrastructure/database/connection");
const OrderModel_1 = require("../src/infrastructure/database/models/OrderModel");
const ItemModel_1 = require("../src/infrastructure/database/models/ItemModel");
const UserModel_1 = require("../src/infrastructure/database/models/UserModel");
const BusinessModel_1 = require("../src/infrastructure/database/models/BusinessModel");
const ItemSizeModel_1 = require("../src/infrastructure/database/models/ItemSizeModel");
const ModifierModel_1 = require("../src/infrastructure/database/models/ModifierModel");
const seedOrders = async () => {
    try {
        console.log('Connecting to database...');
        await (0, connection_1.connectDatabase)();
        console.log('✅ Connected to MongoDB');
        // 1. Get Business
        let business = await BusinessModel_1.BusinessModel.findOne({ id: 'biz_001' });
        if (!business) {
            business = await BusinessModel_1.BusinessModel.findOne();
        }
        if (!business) {
            console.error('❌ No business found. Please run seedBusinesses first.');
            process.exit(1);
        }
        console.log(`Using Business: ${business.name} (${business.id})`);
        // 2. Get/Create a test customer
        let customer = await UserModel_1.UserModel.findOne({ email: 'test-customer@example.com' });
        if (!customer) {
            console.log('Creating test customer...');
            customer = new UserModel_1.UserModel({
                name: 'Test Customer',
                email: 'test-customer@example.com',
                password: 'password123',
                role: 'client',
                isApproved: true,
            });
            await customer.save();
        }
        console.log(`Using Customer: ${customer.name} (${customer._id})`);
        // 3. Get Items, Sizes, and Modifiers
        const items = await ItemModel_1.ItemModel.find({ is_active: true });
        const sizes = await ItemSizeModel_1.ItemSizeModel.find({ deleted_at: null });
        const modifiers = await ModifierModel_1.ModifierModel.find({ deleted_at: null });
        if (items.length === 0) {
            console.error('❌ No active items found. Please run seedItems first.');
            process.exit(1);
        }
        console.log(`Found ${items.length} items, ${sizes.length} sizes, and ${modifiers.length} modifiers.`);
        // 4. Clear existing orders
        console.log('🧹 Clearing existing orders...');
        await OrderModel_1.OrderModel.deleteMany({});
        // 5. Generate Orders
        const statuses = [
            'pending',
            'accepted',
            'inkitchen',
            'ready',
            'out of delivery',
            'completed',
            'canceled',
        ];
        const orders = [];
        const now = new Date();
        console.log('Generating 30 orders...');
        for (let i = 0; i < 30; i++) {
            try {
                const status = statuses[i % statuses.length];
                const orderType = Math.random() > 0.5 ? 'pickup' : 'delivery';
                const serviceTimeType = Math.random() > 0.5 ? 'Schedule' : 'ASAP';
                const numItems = Math.floor(Math.random() * 3) + 1;
                const selectedItems = [];
                let subtotal = 0;
                for (let j = 0; j < numItems; j++) {
                    const item = items[Math.floor(Math.random() * items.length)];
                    const quantity = Math.floor(Math.random() * 2) + 1;
                    let unitPrice = Number(item.base_price) || 0;
                    let sizeId = undefined;
                    let sizeSnap = undefined;
                    // Handle Sizes
                    if (item.is_sizeable && Array.isArray(item.sizes) && item.sizes.length > 0) {
                        const validSizes = item.sizes.filter((s) => s && s.size_id);
                        if (validSizes.length > 0) {
                            const randomSizeRef = validSizes[Math.floor(Math.random() * validSizes.length)];
                            sizeId = randomSizeRef.size_id;
                            unitPrice = Number(randomSizeRef.price) || unitPrice;
                            const sizeData = sizes.find((s) => s && s._id && sizeId && s._id.toString() === sizeId.toString());
                            sizeSnap = sizeData ? sizeData.name : 'Selected Size';
                        }
                    }
                    // Handle Modifiers
                    const itemModifiers = [];
                    let modifierTotals = 0;
                    if (item.is_customizable &&
                        Array.isArray(item.modifier_groups) &&
                        item.modifier_groups.length > 0) {
                        const activeGroups = item.modifier_groups.filter((g) => g && g.modifier_group_id);
                        const selectedGroups = activeGroups.slice(0, Math.min(activeGroups.length, 4));
                        for (const group of selectedGroups) {
                            const groupModifiers = modifiers.filter((m) => m &&
                                m.modifier_group_id &&
                                m.modifier_group_id.toString() === group.modifier_group_id.toString());
                            if (groupModifiers.length > 0) {
                                const mod = groupModifiers[Math.floor(Math.random() * groupModifiers.length)];
                                const priceDelta = Number(mod.price) || 0;
                                itemModifiers.push({
                                    modifier_id: mod._id,
                                    name_snapshot: mod.name || 'Extra',
                                    unit_price_delta: priceDelta,
                                });
                                modifierTotals += priceDelta;
                            }
                        }
                    }
                    const itemUnitPriceWithModifiers = unitPrice + modifierTotals;
                    const lineSubtotal = itemUnitPriceWithModifiers * quantity;
                    selectedItems.push({
                        menu_item_id: item._id,
                        size_id: sizeId,
                        name_snap: item.name || 'Unknown Item',
                        size_snap: sizeSnap,
                        unit_price: unitPrice,
                        quantity: quantity,
                        modifier_totals: modifierTotals,
                        line_subtotal: lineSubtotal,
                        modifiers: itemModifiers,
                    });
                    subtotal += lineSubtotal;
                }
                const taxRate = 0.08;
                const taxTotal = parseFloat((subtotal * taxRate).toFixed(2));
                const deliveryFee = orderType === 'delivery' ? 5.0 : 0;
                const totalAmount = subtotal + taxTotal + deliveryFee;
                const scheduleTime = serviceTimeType === 'Schedule'
                    ? new Date(now.getTime() + (Math.floor(Math.random() * 24) + 1) * 3600000)
                    : null;
                const order = {
                    customer_id: customer._id,
                    order_number: `ORD-${Date.now()}-${i}`,
                    order_type: orderType,
                    service_time_type: serviceTimeType,
                    schedule_time: scheduleTime,
                    status: status,
                    money: {
                        subtotal: subtotal,
                        discount: 0,
                        delivery_fee: deliveryFee,
                        tax_total: taxTotal,
                        tips: 0,
                        total_amount: totalAmount,
                        currency: 'USD',
                        payment: 'Cash',
                    },
                    delivery: {
                        name: customer.name,
                        phone: '555-1234',
                        address: {
                            street: '123 Main St',
                            city: 'Anytown',
                            state: 'CA',
                            zip: '12345',
                        },
                    },
                    items: selectedItems,
                    created_at: new Date(now.getTime() - i * 3600000),
                    updated_at: new Date(),
                };
                if (status === 'completed') {
                    order.completed_at = new Date();
                }
                else if (status === 'canceled') {
                    order.cancelled_at = new Date();
                    order.cancelled_reason = 'Testing cancellation';
                    order.cancelled_by = 'admin';
                }
                orders.push(order);
                console.log(`✅ Generated order ${i + 1}/15`);
            }
            catch (err) {
                console.error(`❌ Error generating order ${i + 1}:`, err.message);
                // Don't throw, just skip this one
            }
        }
        if (orders.length > 0) {
            console.log(`Seeding ${orders.length} enhanced orders...`);
            await OrderModel_1.OrderModel.insertMany(orders);
            console.log('🎉 Enhanced orders seeding completed!');
        }
        else {
            console.error('❌ No orders were generated.');
        }
    }
    catch (error) {
        console.error('❌ Error in seeding process:', error);
        process.exit(1);
    }
    finally {
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};
seedOrders();
