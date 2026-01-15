import 'dotenv/config';
import { connectDatabase } from '../src/infrastructure/database/connection';
import { ModifierGroupModel } from '../src/infrastructure/database/models/ModifierGroupModel';
import { ModifierModel } from '../src/infrastructure/database/models/ModifierModel';
import { BusinessModel } from '../src/infrastructure/database/models/BusinessModel';
import { Types } from 'mongoose';

const seedModifiers = async (): Promise<void> => {
    try {
        console.log('Connecting to database...');
        await connectDatabase();
        console.log('✅ Connected to MongoDB');

        // 1. Get Business
        let business = await BusinessModel.findOne({ id: 'biz_001' });
        if (!business) {
            business = await BusinessModel.findOne();
        }

        if (!business) {
            console.error('❌ No business found. Please run seedBusinesses first.');
            process.exit(1);
        }

        const businessId = business.id;
        console.log(`Using Business ID: ${businessId}`);

        // 2. Clear existing data
        console.log('🧹 Clearing existing modifiers and groups...');
        await ModifierModel.deleteMany({});
        await ModifierGroupModel.deleteMany({ business_id: businessId });

        // 3a. Create Global Sizes
        console.log('Creating global item sizes...');
        const { ItemSizeModel } = await import('../src/infrastructure/database/models/ItemSizeModel'); // Dynamic import to ensure DB connection

        await ItemSizeModel.deleteMany({ business_id: businessId });

        const sizeDocs = await ItemSizeModel.insertMany([
            { business_id: businessId, name: 'Small', code: 'S', display_order: 1, is_active: true },
            { business_id: businessId, name: 'Medium', code: 'M', display_order: 2, is_active: true },
            { business_id: businessId, name: 'Large', code: 'L', display_order: 3, is_active: true },
            { business_id: businessId, name: 'Extra Large', code: 'XL', display_order: 4, is_active: true },
        ]);

        const sizeMap = sizeDocs.reduce((acc: any, size: any) => {
            acc[size.code] = size._id;
            return acc;
        }, {});

        console.log('✅ Created global sizes:', Object.keys(sizeMap));

        // 3b. Define and Create Modifier Groups
        const groupsData = [
            {
                name: 'Size Options',
                display_type: 'RADIO',
                min_select: 1,
                max_select: 1,
                sort_order: 1,
                quantity_levels: [
                    {
                        quantity: 1,
                        name: 'Standard', // Quantity level name
                        price: 0,
                        is_active: true,
                        is_default: true,
                        display_order: 1,
                        prices_by_size: [
                            { size_id: sizeMap['S'], priceDelta: 0 },
                            { size_id: sizeMap['M'], priceDelta: 2.00 }, // Medium +$2
                            { size_id: sizeMap['L'], priceDelta: 4.00 }  // Large +$4
                        ]
                    }
                ]
            },
            {
                name: 'Sauce Selection',
                display_type: 'CHECKBOX',
                min_select: 0,
                max_select: 3,
                sort_order: 2,
                quantity_levels: []
            },
            {
                name: 'Extra Toppings',
                display_type: 'CHECKBOX',
                min_select: 0,
                max_select: 5,
                sort_order: 3,
                quantity_levels: [
                    {
                        quantity: 1,
                        name: 'Standard',
                        price: 1.50,
                        is_active: true,
                        is_default: true,
                        display_order: 1,
                        prices_by_size: []
                    }
                ]
            },
            {
                name: 'Spice Level',
                display_type: 'RADIO',
                min_select: 1,
                max_select: 1,
                sort_order: 4,
                quantity_levels: []
            }
        ];

        console.log('Creating modifier groups...');
        const createdGroups = [];

        for (const groupData of groupsData) {
            const group = await ModifierGroupModel.create({
                business_id: businessId,
                ...groupData
            });
            createdGroups.push(group);
        }

        console.log(`✅ Created ${createdGroups.length} modifier groups.`);

        // 4. Create Modifiers for each Group
        console.log('Creating modifiers...');
        const modifiers = [];

        // Size Options
        const sizeGroup = createdGroups.find(g => g.name === 'Size Options');
        if (sizeGroup) {
            modifiers.push(
                { modifier_group_id: sizeGroup._id, name: 'Small', is_default: false, display_order: 1, price: 0 },
                { modifier_group_id: sizeGroup._id, name: 'Medium', is_default: true, display_order: 2, price: 2.00 },
                { modifier_group_id: sizeGroup._id, name: 'Large', is_default: false, display_order: 3, price: 4.00 }
            );
        }

        // Sauce Selection
        const sauceGroup = createdGroups.find(g => g.name === 'Sauce Selection');
        if (sauceGroup) {
            modifiers.push(
                { modifier_group_id: sauceGroup._id, name: 'Ketchup', display_order: 1 },
                { modifier_group_id: sauceGroup._id, name: 'Mayo', display_order: 2 },
                { modifier_group_id: sauceGroup._id, name: 'Mustard', display_order: 3 },
                { modifier_group_id: sauceGroup._id, name: 'BBQ Sauce', display_order: 4 },
                { modifier_group_id: sauceGroup._id, name: 'Hot Sauce', display_order: 5 }
            );
        }

        // Extra Toppings
        const toppingGroup = createdGroups.find(g => g.name === 'Extra Toppings');
        if (toppingGroup) {
            modifiers.push(
                { modifier_group_id: toppingGroup._id, name: 'Cheese', display_order: 1, price: 1.50 },
                { modifier_group_id: toppingGroup._id, name: 'Bacon', display_order: 2, price: 2.00 },
                { modifier_group_id: toppingGroup._id, name: 'Mushrooms', display_order: 3, price: 1.00 },
                { modifier_group_id: toppingGroup._id, name: 'Onions', display_order: 4, price: 0.50 }
            );
        }

        // Spice Level
        const spiceGroup = createdGroups.find(g => g.name === 'Spice Level');
        if (spiceGroup) {
            modifiers.push(
                { modifier_group_id: spiceGroup._id, name: 'Mild', is_default: true, display_order: 1 },
                { modifier_group_id: spiceGroup._id, name: 'Medium', display_order: 2 },
                { modifier_group_id: spiceGroup._id, name: 'Hot', display_order: 3 },
                { modifier_group_id: spiceGroup._id, name: 'Extra Hot', display_order: 4 }
            );
        }

        // Note: The ModifierModel schema definition I saw earlier does NOT have a 'price' field directly on it.
        // It seems pricing might be handled via 'QuantityLevel' or similar in the Group, OR the schema I saw was incomplete/different usage.
        // However, usually modifiers have prices. Let's re-read the ModifierModel carefully.

        // Re-reading ModifierModel.ts:
        // It has name, is_default, max_quantity, display_order, is_active, sides_config, deleted_at.
        // NO PRICE field.

        // Let's check ModifierGroupModel.ts again.
        // It has QuantityLevelSchema which has price.
        // And PricesBySizeSchema.

        // Wait, if ModifierModel doesn't have price, where is the price stored for a simple modifier like "Cheese $1.50"?
        // In some systems, modifiers are just items. Here, it seems separate.

        // Let's check if there is another related model or if I missed something. 
        // Or maybe pricing is NOT on the modifier but on the group configuration if it's "Quantity Level"?

        // Actually, looking at ModifierGroupModel logic:
        // `quantity_levels` has `name`, `price`, `is_default`, `display_order`.

        // If the `Modifier` entity is just a "choice" within a group, maybe the cost is associated with that choice.
        // But `ModifierModel` definitely didn't show a price field.

        // Let's check `Modifier` entity definition in `src/domain/entities/Modifier.ts` if possible, but I don't have it open.
        // I will trust `ModifierModel.ts` I just read. It has NO price.

        // This implies that perhaps "Modifiers" in this system are purely option names, and maybe they link to Items? 
        // OR the pricing is handled differently.

        // However, for SEEDING purposes, I will just create the Modifiers as they are defined in the schema.
        // If price is missing, I will omit it. The user just asked to seed modifiers to test the "page", which lists them.

        // So I will remove 'price' from the modifier objects in my insert.

        const modifierDocs = modifiers.map(m => {
            // Remove price if present as it's not in schema
            const { price, ...rest } = m as any;
            return rest;
        });

        await ModifierModel.insertMany(modifierDocs);
        console.log(`✅ Created ${modifierDocs.length} modifiers.`);

        console.log('🎉 Modifiers seeding completed!');

    } catch (error) {
        console.error('❌ Error seeding modifiers:', error);
        process.exit(1);
    } finally {
        const mongoose = await import('mongoose');
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

seedModifiers();
