export const UpdateWithdrawStatusRequest = {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['approved', 'rejected'], example: 'approved' },
          notes: { type: 'string', example: 'Processed successfully' },
        },
      };
