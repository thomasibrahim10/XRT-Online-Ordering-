export const CreateWithdrawRequest = {
        type: 'object',
        required: ['amount', 'businessId'],
        properties: {
          amount: { type: 'number', min: 1, example: 500.00 },
          businessId: { type: 'string', example: '507f1f77bcf86cd799439011' },
          notes: { type: 'string', example: 'Urgent request' },
        },
      };
