export const ResetPasswordRequest = {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', minLength: 8, example: 'newpassword123' },
          confirmPassword: { type: 'string', example: 'newpassword123' },
        },
      };
