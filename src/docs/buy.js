const txnResponse = {
  _id: {
    type: 'string',
    example: '60564fcb544047cdc3844818'
  },
  timestamp: {
    type: 'int',
    example: 1638164064
  },
  tokenId: {
    type: 'int',
    example: 26
  },
  itemId: {
    type: 'int',
    example: 1
  },
  contractAddress: {
    type: 'string',
    example: '0x842452073b2841651D2f36Cb056Ed1c5311ae19b'
  },
  nftAddress: {
    type: 'string',
    example: '0x9882eD5E42C4b7818A86BFC05aAed899a610E60d'
  },
  transactionHash: {
    type: 'string',
    example: '0x8bcb84ddd61a9319e42e26086a0a4748a5ba3f4f4fc7e4540af83eb5cf4896f5'
  },
  from: {
    type: 'string',
    example: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0'
  },
  to: {
    type: 'string',
    example: '0x842452073b2841651D2f36Cb056Ed1c5311ae19b'
  },
  value: {
    type: 'int',
    example: 0
  },
  price: {
    type: 'object',
    properties: priceObject
  }
};

const priceObject = {
  value: {
    type: 'int',
    example: 1000000000000000000
  },
  info: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        example: '0x7BbDFe11F3d1b1ec607c03EbBC455C312eB78641'
      },
      symbol: {
        type: 'string',
        example: 'SC'
      },
      name: {
        type: 'string',
        example: 'StableCoin'
      },
      decimals: {
        type: 'int',
        example: 18
      }
    }
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
    properties: txnResponse
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
      properties: txnResponse
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

const invalidData = {
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
            example: 'The fields field1, field2 and field3 invalid'
          }
        }
      }
    }
  }
};

const buyTransactionHistories = {
  tags: ['Buy'],
  description: 'Get last transactions or search by ItemId',
  operationId: 'buyTransactionHistories',
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
          $ref: '#/components/schemas/searchBuyTransactionBody'
        }
      }
    },
    required: false
  },
  responses: {
    '200': {
      description: 'Search Buy Transaction Successfully and pagination',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseDocs
          }
        }
      }
    },
    '404': invalidData,
    '500': internalServerError
  }
};

const searchBuyTransactionBody = {
  type: 'object',
  required: false,
  description: 'Search Buy Transaction default by empty to search last 20 transactions',
  properties: {
    limit: {
      type: 'int',
      description: 'Limit items in query',
      example: 20
    },
    skip: {
      type: 'int',
      description: 'Pagination in query',
      example: 0
    },
    orderBy: {
      type: 'object',
      description: 'Order by many field of Buy transaction, default timestamp for descending',
      example: {
        timestamp: 'desc'
      }
    },
    where: {
      type: 'object',
      description: 'Filter by many field of Buy transaction or empty for all',
      example: {
        itemId: 1
      }
    }
  }
};

export { buyTransactionHistories, searchBuyTransactionBody, priceObject, pageInfoResponse };
