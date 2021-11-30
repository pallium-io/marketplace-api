const priceObject = {
  value: {
    type: 'int',
    example: 1000000000000000000
  },
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
};

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

const itemResponse = {
  _id: {
    type: 'string',
    example: '61a44effa2801139337229f1'
  },
  type: {
    type: 'string',
    example: 'bulk'
  },
  item_id: { type: 'int', example: 1 },
  contract_address: {
    type: 'string',
    example: '0x842452073b2841651D2f36Cb056Ed1c5311ae19b'
  },
  timestamp: { type: 'int', example: 1638158050 },
  tx_hash: {
    type: 'string',
    example: '0x4a9a434f874e4e2533f22f6e05ab44bef28139693552462543a83e9c80d50aaf'
  },
  bulk_total: { type: 'int', example: 23600 },
  bulk_quantity: { type: 'int', example: 23580 },
  price: { type: 'object', properties: priceObject }
};

const responseTopSolds = {
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
      properties: { ...itemResponse, token_id: { type: 'int', example: 1 } }
    }
  }
};

const responseRecentlyListing = {
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
      properties: itemResponse
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

const getTopSolds = {
  tags: ['Analysis'],
  description: 'Get top NFT sold',
  operationId: 'getTopSolds',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  parameters: [
    {
      name: 'limit',
      in: 'query',
      description: 'The numbers of nfts sold to return',
      required: false,
      type: 'int',
      default: 10
    }
  ],
  responses: {
    '200': {
      description: 'Successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseTopSolds
          }
        }
      }
    },
    '404': notFound,
    '500': internalServerError
  }
};

const recentlyListing = {
  tags: ['Analysis'],
  description: 'Get recently listed item',
  operationId: 'recentlyListing',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  parameters: [
    {
      name: 'skip',
      in: 'query',
      description: 'The number of items to skip before starting to collect the result set',
      required: true,
      type: 'int',
      default: 0
    },
    {
      name: 'limit',
      in: 'query',
      description: 'The number of items listed to return',
      required: true,
      type: 'int',
      default: 20
    }
  ],
  responses: {
    '200': {
      description: 'Successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: responseRecentlyListing
          }
        }
      }
    },
    '404': notFound,
    '500': internalServerError
  }
};

export { getTopSellers, getTopSolds, recentlyListing };
