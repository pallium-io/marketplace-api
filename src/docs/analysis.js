const sellerResponse = {
  _id: {
    type: 'string',
    example: '0x842452073b2841651D2f36Cb056Ed1c5311ae19b'
  },
  numberOfNFTSold: {
    type: 'int',
    example: 7
  },
  detail: {
    type: 'object',
    itemId: {
      type: 'int',
      example: 1
    },
    transactionHash: {
      type: 'string',
      example: '0x8bcb84ddd61a9319e42e26086a0a4748a5ba3f4f4fc7e4540af83eb5cf4896f5'
    },
    timestamp: {
      type: 'int',
      example: 1638164064
    }
  }
};

const responseTopSellers = {
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
      properties: sellerResponse
    }
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

const notFound = {
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
            example: 'Not found'
          }
        }
      }
    }
  }
};

const getTopSellers = {
  tags: ['Analysis'],
  description: 'Get top 10 sellers',
  operationId: 'getTopSellers',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  responses: {
    '200': {
      description: 'Successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseTopSellers
          }
        }
      }
    },
    '404': notFound,
    '500': internalServerError
  }
};

export { getTopSellers };
