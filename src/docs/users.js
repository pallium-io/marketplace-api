const userResponse = {
  _id: {
    type: 'string',
    example: '60564fcb544047cdc3844818'
  },
  status: {
    type: 'int',
    example: 1
  },
  firstName: {
    type: 'string',
    example: 'John'
  },
  lastName: {
    type: 'string',
    example: 'Snow'
  },
  username: {
    type: 'string',
    example: 'john.snow'
  },
  email: {
    type: 'string',
    example: 'john.snow@email.com'
  },
  password: {
    type: 'string',
    example: '442893aba778ab321dc151d9b1ad98c64ed56c07f8cbaed'
  },
  role: {
    type: 'int',
    example: 1
  },
  createdAt: {
    type: 'string',
    example: '2021-03-20T19:40:59.495Z'
  },
  updatedAt: {
    type: 'string',
    example: '2021-03-20T21:23:10.879Z'
  },
  accessToken: {
    type: 'string',
    example: '442893aba778ab321dc151d9b1ad98c64ed56c07f8cbaed'
  },
  refreshToken: {
    type: 'string',
    example: '552893aba778ab321dc151d9b1ad98c64ed56c07f8cbaed'
  },
  lastActivity: {
    type: 'string',
    example: '2021-03-20T21:23:10.879Z'
  },
  lastPassDate: {
    type: 'string',
    example: '2021-03-20T21:23:10.879Z'
  },
  createdBy: {
    type: 'string',
    example: '60564fcb544047cdc3844811'
  },
  updatedBy: {
    type: 'string',
    example: '60564fcb544047cdc3844818'
  }
};

const pageInfoResponse = {
  limit: {
    type: 'int',
    example: 10
  },
  totalDocs: {
    type: 'int',
    example: 4
  },
  totalPage: {
    type: 'int',
    example: 1
  },
  currentPage: {
    type: 'int',
    example: 1
  },
  hasNextPage: {
    type: 'boolean',
    example: false
  },
  hasPreviousPage: {
    type: 'boolean',
    example: false
  }
};

const responseDoc = {
  statusCode: {
    type: 'int',
    example: 200
  },
  message: {
    type: 'string',
    example: 'Successful'
  },
  data: {
    type: 'object',
    properties: userResponse
  }
};

const responseDocWithNoData = {
  statusCode: {
    type: 'int',
    example: 200
  },
  message: {
    type: 'string',
    example: 'Successful'
  }
};

const responseDocs = {
  statusCode: {
    type: 'int',
    example: 200
  },
  message: {
    type: 'string',
    example: 'Successful'
  },
  data: {
    type: 'array',
    items: {
      type: 'object',
      properties: userResponse
    }
  },
  pageInfo: {
    type: 'object',
    properties: pageInfoResponse
  }
};

const internalServerError = {
  description: 'Internal Server Error',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'int',
            example: 500
          },
          message: {
            type: 'string',
            example: 'Internal Server Error'
          }
        }
      }
    }
  }
};

const userNotFound = {
  description: 'Resource not found',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'int',
            example: 404
          },
          message: {
            type: 'string',
            example: 'User not found'
          }
        }
      }
    }
  }
};

const invalidUserData = {
  description: 'Invalid Data provided',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'int',
            example: 404
          },
          message: {
            type: 'string',
            example: 'The fields field1, field2 and field3 are required'
          }
        }
      }
    }
  }
};

const incorrectData = {
  description: 'Incorrect Data',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'int',
            example: 404
          },
          message: {
            type: 'string',
            example: 'Incorrect Data'
          }
        }
      }
    }
  }
};

const getMe = {
  tags: ['User'],
  description: 'Retrieve user',
  operationId: 'getMe',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  responses: {
    '200': {
      description: 'Users retrieved successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDoc
          }
        }
      }
    },
    '404': userNotFound,
    '500': internalServerError
  }
};

const logout = {
  tags: ['User'],
  description: 'Logout user',
  operationId: 'logout',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  parameters: [
    {
      name: 'resetAll',
      in: 'body',
      description: 'Logout all devices',
      required: true,
      type: 'boolean'
    }
  ],
  responses: {
    '200': {
      description: 'Users logout successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDocWithNoData
          }
        }
      }
    },
    '404': userNotFound,
    '500': internalServerError
  }
};

const login = {
  tags: ['User'],
  description: 'Retrieve user',
  operationId: 'login',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  parameters: [
    {
      name: 'username',
      in: 'body',
      description: 'UserName or Email',
      required: true,
      type: 'string'
    },
    {
      name: 'password',
      in: 'body',
      description: 'Password',
      required: true,
      type: 'string'
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/loginBody'
        }
      }
    },
    required: true
  },
  responses: {
    '200': {
      description: 'Users retrieved successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDoc
          }
        }
      }
    },
    '404': userNotFound,
    '500': internalServerError
  }
};

const loginBody = {
  type: 'object',
  properties: {
    username: {
      type: 'string',
      example: 'john'
    },
    password: {
      type: 'string',
      example: '123456'
    }
  }
};

const register = {
  tags: ['User'],
  description: 'Create user',
  operationId: 'register',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/registerBody'
        }
      }
    },
    required: true
  },
  responses: {
    '200': {
      description: 'User created successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDoc
          }
        }
      }
    },
    '404': userNotFound,
    '500': internalServerError
  }
};

const registerBody = {
  type: 'object',
  properties: {
    status: {
      type: 'int',
      example: 1
    },
    firstName: {
      type: 'string',
      example: 'John'
    },
    lastName: {
      type: 'string',
      example: 'Snow'
    },
    username: {
      type: 'string',
      example: 'john.snow'
    },
    email: {
      type: 'string',
      example: 'john.snow@email.com'
    },
    password: {
      type: 'string',
      example: '123456'
    },
    role: {
      type: 'int',
      example: 2
    }
  }
};

const changePassword = {
  tags: ['User'],
  description: 'Change Password user',
  operationId: 'changePassword',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/changePasswordBody'
        }
      }
    },
    required: true
  },
  responses: {
    '200': {
      description: 'User changed successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDoc
          }
        }
      }
    },
    '404': incorrectData,
    '500': internalServerError
  }
};

const changePasswordBody = {
  type: 'object',
  properties: {
    oldPassword: {
      type: 'string',
      example: '123456'
    },
    newPassword: {
      type: 'string',
      example: '12345678'
    }
  }
};

const getUser = {
  tags: ['User'],
  description: 'Retrieve user',
  operationId: 'getUser',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  parameters: [
    {
      name: 'id',
      in: 'path',
      description: 'User ID',
      required: true,
      type: 'string'
    }
  ],
  responses: {
    '200': {
      description: 'Users retrieved successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDoc
          }
        }
      }
    },
    '404': userNotFound,
    '500': internalServerError
  }
};

const getUsers = {
  tags: ['User'],
  description: 'Retrieve all the users',
  operationId: 'getUsers',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/getUsersBody'
        }
      }
    },
    required: false
  },
  responses: {
    '200': {
      description: 'Users retrieved successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDocs
          }
        }
      }
    },
    '404': invalidUserData,
    '500': internalServerError
  }
};

const getUsersBody = {
  type: 'object',
  properties: {
    limit: {
      type: 'int',
      description: 'Limit items in query',
      example: 10
    },
    skip: {
      type: 'int',
      description: 'Pagination in query',
      example: 0
    },
    orderBy: {
      type: 'object',
      description: 'Order by many field of user',
      example: {
        username: 'asc',
        role: 'desc'
      }
    },
    where: {
      type: 'object',
      description: 'Filter by many field of user',
      example: {
        email: '@'
      }
    }
  }
};

const updateUserInfo = {
  tags: ['User'],
  description: 'Update User Info',
  operationId: 'updateUserInfo',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/updateUserInfoBody'
        }
      }
    },
    required: true
  },
  responses: {
    '200': {
      description: 'User updated successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDoc
          }
        }
      }
    },
    '404': invalidUserData,
    '500': internalServerError
  }
};

const updateUserInfoBody = {
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      example: 'John'
    },
    lastName: {
      type: 'string',
      example: 'Snow'
    },
    avatar: {
      type: 'string',
      example: 'Link'
    },
    phoneNumber: {
      type: 'string',
      example: '090123456'
    }
  }
};

const updateUserPermission = {
  tags: ['User'],
  description: 'Update User Permission',
  operationId: 'updateUserPermission',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          $ref: '#/components/schemas/updateUserPermissionBody'
        }
      }
    },
    required: true
  },
  responses: {
    '200': {
      description: 'User updated successfully!',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDoc
          }
        }
      }
    },
    '404': invalidUserData,
    '500': internalServerError
  }
};

const updateUserPermissionBody = {
  type: 'object',
  properties: {
    userId: {
      type: 'ID',
      example: '6166a9eb55ef247819585342'
    },
    status: {
      type: 'int',
      description: 'Status of user',
      example: 2
    },
    role: {
      type: 'int',
      description: 'Role of user',
      example: 3
    }
  }
};

export {
  getMe,
  login,
  loginBody,
  registerBody,
  register,
  logout,
  changePassword,
  changePasswordBody,
  getUser,
  getUsers,
  getUsersBody,
  updateUserInfo,
  updateUserInfoBody,
  updateUserPermission,
  updateUserPermissionBody
};
