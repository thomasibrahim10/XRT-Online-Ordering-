// Static Swagger configuration - no external libraries
export const specs = {
  openapi: '3.0.0',
  info: {
    title: 'XRT Customized System API',
    version: '1.0.0',
    description: 'Enterprise-grade API for authentication, user management, and role-based access control',
    contact: {
      name: 'API Support',
      email: 'support@xrt.com'
    }
  },
  servers: [
    {
      url: 'https://xrt-online-ordering.vercel.app/api/v1',
      description: 'Production',
    },
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Development',
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from login endpoint'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { 
            type: 'string', 
            enum: ['super_admin', 'admin', 'manager', 'client', 'user'],
            example: 'client'
          },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'content:create']
          },
          isApproved: { type: 'boolean', example: true },
          isBanned: { type: 'boolean', example: false },
          banReason: { type: 'string', example: null },
          customRole: { type: 'string', example: null },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Role: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'content-manager' },
          displayName: { type: 'string', example: 'Content Manager' },
          description: { type: 'string', example: 'Can manage content but not users' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update']
          },
          isSystem: { type: 'boolean', example: false },
          createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' }
            }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Validation failed' }
        }
      },
      Customer: {
        type: 'object',
        required: ['name', 'email', 'phoneNumber', 'business_id', 'location_id'],
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          phoneNumber: { type: 'string', example: '+1234567890' },
          business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          location_id: { type: 'string', example: '507f1f77bcf86cd799439012' },
          rewards: { type: 'number', example: 150 },
          isActive: { type: 'boolean', example: true },
          last_order_at: { type: 'string', format: 'date-time', example: '2023-12-01T10:30:00Z' },
          preferences: {
            type: 'object',
            properties: {
              dietary: {
                type: 'array',
                items: { type: 'string' },
                example: ['vegetarian']
              },
              allergies: {
                type: 'array',
                items: { type: 'string' },
                example: ['nuts']
              },
              favoriteItems: {
                type: 'array',
                items: { type: 'string' },
                example: ['Pizza', 'Burger']
              },
              specialInstructions: { type: 'string', example: 'No onions please' }
            }
          },
          addresses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['home', 'work', 'other'], example: 'home' },
                street: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
                zipCode: { type: 'string', example: '10001' },
                country: { type: 'string', example: 'USA' },
                isDefault: { type: 'boolean', example: true }
              }
            }
          },
          loyaltyTier: {
            type: 'string',
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            example: 'silver'
          },
          totalOrders: { type: 'number', example: 25 },
          totalSpent: { type: 'number', example: 1250.50 },
          notes: { type: 'string', example: 'VIP customer, prefers delivery' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 8, example: 'password123' },
          role: { 
            type: 'string', 
            enum: ['super_admin', 'admin', 'manager', 'client', 'user'],
            default: 'client',
            example: 'client'
          }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
        }
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['password'],
        properties: {
          password: { type: 'string', minLength: 8, example: 'newpassword123' },
          confirmPassword: { type: 'string', example: 'newpassword123' }
        }
      },
      UpdatePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string', example: 'oldpassword123' },
          newPassword: { type: 'string', minLength: 8, example: 'newpassword123' },
          confirmPassword: { type: 'string', example: 'newpassword123' }
        }
      },
      CreateRoleRequest: {
        type: 'object',
        required: ['name', 'displayName'],
        properties: {
          name: { type: 'string', example: 'content-manager' },
          displayName: { type: 'string', example: 'Content Manager' },
          description: { type: 'string', example: 'Can manage content but not users' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update']
          }
        }
      },
      UpdateRoleRequest: {
        type: 'object',
        properties: {
          displayName: { type: 'string', example: 'Updated Content Manager' },
          description: { type: 'string', example: 'Updated description' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['content:read', 'content:create', 'content:update', 'content:delete']
          }
        }
      },
      AssignRoleRequest: {
        type: 'object',
        required: ['roleId'],
        properties: {
          roleId: { type: 'string', example: '507f1f77bcf86cd799439011' }
        }
      },
      BanUserRequest: {
        type: 'object',
        properties: {
          isBanned: { type: 'boolean', example: true },
          banReason: { type: 'string', example: 'Violation of terms of service' }
        }
      },
      UpdatePermissionsRequest: {
        type: 'object',
        required: ['permissions'],
        properties: {
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['users:read', 'content:create']
          }
        }
      }
    }
  },
  paths: {
    '/api/v1/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          400: {
            description: 'Bad request - validation error or duplicate email',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          403: {
            description: 'Account not approved or banned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/refresh-token': {
      post: {
        summary: 'Refresh access token using refresh token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    accessToken: { type: 'string' }
                  }
                }
              }
            }
          },
          401: {
            description: 'Invalid or expired refresh token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/forgot-password': {
      post: {
        summary: 'Request password reset email',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset email sent',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    message: { type: 'string', example: 'Password reset email sent' }
                  }
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/reset-password/{token}': {
      patch: {
        summary: 'Reset password using token',
        tags: ['Authentication'],
        parameters: [
          {
            in: 'path',
            name: 'token',
            required: true,
            schema: { type: 'string' },
            description: 'Password reset token'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Password reset successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          400: {
            description: 'Invalid or expired token',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/update-password': {
      patch: {
        summary: 'Update user password (requires authentication)',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePasswordRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Password updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          401: {
            description: 'Authentication required or invalid current password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Logout user and clear cookies',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/users': {
      get: {
        summary: 'Get all users (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of users retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'number', example: 10 },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          403: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/users/{id}/approve': {
      patch: {
        summary: 'Approve a user account (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID'
          }
        ],
        responses: {
          200: {
            description: 'User approved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/users/{id}/ban': {
      patch: {
        summary: 'Ban or unban a user (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BanUserRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'User ban status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/users/{id}': {
      delete: {
        summary: 'Delete a user (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID'
          }
        ],
        responses: {
          204: {
            description: 'User deleted successfully'
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/users/{id}/permissions': {
      patch: {
        summary: 'Update user permissions (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePermissionsRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'User permissions updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/users/{id}/permissions-get': {
      get: {
        summary: 'Get user permissions (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID'
          }
        ],
        responses: {
          200: {
            description: 'User permissions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        permissions: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        role: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/auth/permissions': {
      get: {
        summary: 'Get all available permissions (Admin only)',
        tags: ['User Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'All available permissions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        permissions: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Array of all available permissions'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/roles': {
      post: {
        summary: 'Create a new role (Admin only)',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRoleRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Role created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        role: { $ref: '#/components/schemas/Role' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation error or duplicate role name',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          401: {
            description: 'Authentication required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          403: {
            description: 'Insufficient permissions',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      get: {
        summary: 'Get all roles',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of roles retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        roles: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Role' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/roles/{id}': {
      get: {
        summary: 'Get role by ID',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID'
          }
        ],
        responses: {
          200: {
            description: 'Role retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        role: { $ref: '#/components/schemas/Role' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      patch: {
        summary: 'Update role',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateRoleRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Role updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        role: { $ref: '#/components/schemas/Role' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          403: {
            description: 'Cannot modify system roles',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete role',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID'
          }
        ],
        responses: {
          204: {
            description: 'Role deleted successfully'
          },
          404: {
            description: 'Role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          400: {
            description: 'Cannot delete system role or role assigned to users',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/roles/users/{id}/assign': {
      patch: {
        summary: 'Assign role to user',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssignRoleRequest' }
            }
          }
        },
        responses: {
          200: {
            description: 'Role assigned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'User or role not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/roles/users/{id}/remove': {
      patch: {
        summary: 'Remove role from user',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID'
          }
        ],
        responses: {
          200: {
            description: 'Role removed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/roles/users/{roleId}': {
      get: {
        summary: 'Get users with specific role',
        tags: ['Role Management'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'roleId',
            required: true,
            schema: { type: 'string' },
            description: 'Role ID'
          }
        ],
        responses: {
          200: {
            description: 'Users with role retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/User' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/customers': {
      post: {
        summary: 'Create a new customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'phoneNumber', 'business_id', 'location_id'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', format: 'email', example: 'john@example.com' },
                  phoneNumber: { type: 'string', example: '+1234567890' },
                  business_id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  location_id: { type: 'string', example: '507f1f77bcf86cd799439012' },
                  preferences: { type: 'object' },
                  addresses: { type: 'array' },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Customer created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Bad request - validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          },
          404: {
            description: 'Business or Location not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      get: {
        summary: 'Get all customers (with optional filtering)',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'business_id',
            schema: { type: 'string' },
            description: 'Filter by business ID'
          },
          {
            in: 'query',
            name: 'location_id',
            schema: { type: 'string' },
            description: 'Filter by location ID'
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number for pagination'
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of items per page'
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search by name or email'
          }
        ],
        responses: {
          200: {
            description: 'Customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    total: { type: 'integer' },
                    page: { type: 'integer' },
                    pages: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/customers/{id}': {
      get: {
        summary: 'Get a single customer by ID',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID'
          }
        ],
        responses: {
          200: {
            description: 'Customer retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      patch: {
        summary: 'Update a customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phoneNumber: { type: 'string' },
                  business_id: { type: 'string' },
                  location_id: { type: 'string' },
                  rewards: { type: 'number' },
                  preferences: { type: 'object' },
                  addresses: { type: 'array' },
                  notes: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Customer updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete a customer (soft delete)',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID'
          }
        ],
        responses: {
          204: {
            description: 'Customer deleted successfully'
          },
          404: {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/api/v1/customers/top-rewards': {
      get: {
        summary: 'Get top customers by rewards points',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Number of top customers to return'
          }
        ],
        responses: {
          200: {
            description: 'Top customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/customers/business/{businessId}': {
      get: {
        summary: 'Get customers by business ID',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'businessId',
            required: true,
            schema: { type: 'string' },
            description: 'Business ID'
          }
        ],
        responses: {
          200: {
            description: 'Customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/customers/location/{locationId}': {
      get: {
        summary: 'Get customers by location ID',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'locationId',
            required: true,
            schema: { type: 'string' },
            description: 'Location ID'
          }
        ],
        responses: {
          200: {
            description: 'Customers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    results: { type: 'integer' },
                    data: {
                      type: 'object',
                      properties: {
                        customers: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Customer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/customers/{id}/rewards/add': {
      patch: {
        summary: 'Add rewards points to a customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['points'],
                properties: {
                  points: { type: 'number', minimum: 1, description: 'Number of points to add' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Rewards added successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/customers/{id}/rewards/redeem': {
      patch: {
        summary: 'Redeem rewards points from a customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['points'],
                properties: {
                  points: { type: 'number', minimum: 1, description: 'Number of points to redeem' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Rewards redeemed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: {
                      type: 'object',
                      properties: {
                        customer: { $ref: '#/components/schemas/Customer' }
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Insufficient rewards points',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
};

// Export empty swaggerUi since we're not using it
export const swaggerUi = null;
