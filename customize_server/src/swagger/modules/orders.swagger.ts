export const orders_paths = {
  '/orders': {
    post: {
      tags: ['Orders'],
      summary: 'Create a new order',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                customer_id: { type: 'string' },
                order_type: { type: 'string', enum: ['pickup', 'delivery'] },
                service_time_type: { type: 'string', enum: ['ASAP', 'Schedule'] },
                schedule_time: { type: 'string', format: 'date-time' },
                money: {
                  type: 'object',
                  properties: {
                    subtotal: { type: 'number' },
                    discount: { type: 'number', default: 0 },
                    delivery_fee: { type: 'number', default: 0 },
                    tax_total: { type: 'number', default: 0 },
                    tips: { type: 'number', default: 0 },
                    total_amount: { type: 'number' },
                    currency: { type: 'string', default: 'USD' },
                    payment: { type: 'string' },
                  },
                },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      menu_item_id: { type: 'string' },
                      size_id: { type: 'string' },
                      name_snap: { type: 'string' },
                      size_snap: { type: 'string' },
                      unit_price: { type: 'number' },
                      quantity: { type: 'number' },
                      special_notes: { type: 'string' },
                      modifiers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            modifier_id: { type: 'string' },
                            name_snapshot: { type: 'string' },
                            modifier_quantity_id: { type: 'string' },
                            quantity_label_snapshot: { type: 'string' },
                            unit_price_delta: { type: 'number' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Order created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string' },
                  data: { $ref: '#/components/schemas/Order' },
                },
              },
            },
          },
        },
      },
    },
    get: {
      tags: ['Orders'],
      summary: 'Get all orders',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'customer_id', in: 'query', schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer' } },
        { name: 'limit', in: 'query', schema: { type: 'integer' } },
      ],
      responses: {
        200: {
          description: 'A list of orders',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/orders/{id}': {
    get: {
      tags: ['Orders'],
      summary: 'Get order by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: {
          description: 'Order details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Order' },
                },
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['Orders'],
      summary: 'Delete order',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        200: { description: 'Order deleted successfully' },
      },
    },
  },
  '/orders/{id}/status': {
    put: {
      tags: ['Orders'],
      summary: 'Update order status',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'accepted' },
                cancelled_reason: { type: 'string', example: 'Out of stock' },
                cancelled_by: { type: 'string', example: 'admin' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Order status updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { $ref: '#/components/schemas/Order' },
                },
              },
            },
          },
        },
      },
    },
  },
};
