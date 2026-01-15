export const ItemModifierOverride = {
        type: 'object',
        required: ['modifier_id'],
        description: 'Item-level override for a specific modifier. These overrides apply ONLY to the item and do not affect the modifier or modifier group globally.',
        properties: {
          modifier_id: {
            type: 'string',
            example: '507f1f77bcf86cd799439012',
            description: 'ID of the modifier to override (must belong to the modifier group)',
          },
          max_quantity: {
            type: 'integer',
            minimum: 1,
            example: 5,
            description: 'Override max_quantity for this modifier (item-level only, optional)',
          },
          is_default: {
            type: 'boolean',
            example: true,
            description: 'Override is_default flag for this modifier (item-level only, optional)',
          },
          prices_by_size: {
            type: 'array',
            description: 'Item-level price deltas per size for this modifier (overrides group and modifier defaults, optional)',
            items: { $ref: '#/components/schemas/ItemModifierPriceOverride' },
          },
          quantity_levels: {
            type: 'array',
            description: 'Item-level quantity levels for this modifier (overrides group and modifier defaults, optional)',
            items: { $ref: '#/components/schemas/ItemModifierQuantityLevelOverride' },
          },
        },
      };
