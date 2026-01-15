export const UpdateBusinessOwnerRequest = {
        type: 'object',
        required: ['ownerId'],
        properties: {
          ownerId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'New owner user ID',
          },
        },
      };
