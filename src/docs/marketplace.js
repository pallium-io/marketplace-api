const priceObject = {
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

const txnResponse = {
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
  price: {
    type: 'object',
    properties: priceObject
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

const getTransactionHistories = {
  tags: ['MarketPlace'],
  description: 'Get last transactions or query itemId with pagination',
  operationId: 'getTransactionHistories',
  security: [
    {
      Token: [],
      RefreshToken: []
    }
  ],
  parameters: [
    {
      name: 'itemId',
      in: 'query',
      description: 'ID of listed item',
      type: 'int'
    },
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
            properties: responseDocs
          }
        }
      }
    },
    '404': notFound,
    '500': internalServerError
  }
};

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

const responseTopSold = {
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
  tags: ['MarketPlace'],
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

const getTopSold = {
  tags: ['MarketPlace'],
  description: 'Get top NFT sold',
  operationId: 'getTopSold',
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
            properties: responseTopSold
          }
        }
      }
    },
    '404': notFound,
    '500': internalServerError
  }
};

const recentlyListings = {
  tags: ['MarketPlace'],
  description: 'Get recently listed item',
  operationId: 'recentlyListings',
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

export { getTopSellers, getTopSold, recentlyListings, getTransactionHistories };
