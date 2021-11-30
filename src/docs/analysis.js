import { pageInfoResponse, priceObject } from './buy';

const totalIncomeResponse = {
  numberOfNFTSold: {
    type: 'int',
    example: 20
  },
  value: {
    type: 'int',
    example: 1000000000000000000
  },
  erc20Address: {
    type: 'string',
    example: '0x7BbDFe11F3d1b1ec607c03EbBC455C312eB78641'
  },
  decimals: {
    type: 'int',
    example: 18
  },
  symbol: {
    type: 'string',
    example: 'SC'
  },
  name: {
    type: 'string',
    example: 'StableCoin'
  }
};

const sellerDetailResponse = {
  itemId: {
    type: 'int',
    example: 1
  },
  totalIncome: { type: 'array', items: { type: 'object', properties: totalIncomeResponse } }
};

const sellerResponse = {
  sellerAddress: {
    type: 'string',
    example: '0x842452073b2841651D2f36Cb056Ed1c5311ae19b'
  },
  totalNFTSold: {
    type: 'int',
    example: 20
  },
  detail: { type: 'array', items: { type: 'object', properties: sellerDetailResponse } }
};

const responseTopSellers = {
  statusCode: {
    type: 'int',
    example: 200
  },
  message: {
    type: 'string',
    example: 'Success'
  },
  data: {
    type: 'array',
    items: {
      type: 'object',
      properties: sellerResponse
    }
  }
};

const topSoldResponse = {
  type: {
    type: 'string',
    example: 'bulk'
  },
  itemId: { type: 'int', example: 1 },
  contractAddress: {
    type: 'string',
    example: '0x842452073b2841651D2f36Cb056Ed1c5311ae19b'
  },
  bulkTotal: { type: 'int', example: 23600 },
  bulkQuantity: { type: 'int', example: 23580 },
  totalNFTSold: { type: 'int', example: 20 },
  totalIncome: { type: 'array', items: { type: 'object', properties: totalIncomeResponse } }
};

const responseTopSolds = {
  statusCode: {
    type: 'int',
    example: 200
  },
  message: {
    type: 'string',
    example: 'Success'
  },
  data: {
    type: 'array',
    items: {
      type: 'object',
      properties: topSoldResponse
    }
  }
};

const recentlyListingResponse = {
  type: {
    type: 'string',
    example: 'bulk'
  },
  itemId: { type: 'int', example: 1 },
  contractAddress: {
    type: 'string',
    example: '0x842452073b2841651D2f36Cb056Ed1c5311ae19b'
  },
  timestamp: { type: 'int', example: 1638158050 },
  transactionHash: {
    type: 'string',
    example: '0x4a9a434f874e4e2533f22f6e05ab44bef28139693552462543a83e9c80d50aaf'
  },
  bulkTotal: { type: 'int', example: 23600 },
  bulkQuantity: { type: 'int', example: 23580 },
  price: { type: 'object', properties: priceObject }
};

const responseRecentlyListing = {
  statusCode: {
    type: 'int',
    example: 200
  },
  message: {
    type: 'string',
    example: 'Success'
  },
  data: {
    type: 'array',
    items: {
      type: 'object',
      properties: recentlyListingResponse
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
      description: 'Success',
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
      description: 'Success',
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
      description: 'Success',
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
