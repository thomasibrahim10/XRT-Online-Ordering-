export const BanUserRequest = {
        type: 'object',
        properties: {
          isBanned: { type: 'boolean', example: true },
          banReason: { type: 'string', example: 'Violation of terms of service' },
        },
      };
