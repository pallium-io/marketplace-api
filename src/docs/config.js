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
    type: 'object'
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

const getConfig = {
  tags: ['Config'],
  description: 'Retrieve config',
  operationId: 'getConfig',
  responses: {
    '200': {
      description: 'Successfully!',
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

export { getConfig };
