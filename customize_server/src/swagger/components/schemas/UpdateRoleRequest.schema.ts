export const UpdateRoleRequest = {
        type: 'object',
        properties: {
          displayName: { type: 'string', example: 'Updated Content Manager' },
          description: { type: 'string', example: 'Updated description' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update', 'content:delete'],
          },
        },
      };
