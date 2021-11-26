import {
  getMe,
  login,
  loginBody,
  register,
  registerBody,
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
} from './users';

import { getConfig } from './config';

const apiDocumentation = {
  openapi: '3.0.1',
  info: {
    version: '1.0.0',
    title: 'RESTful API - Documentation',
    description: 'Description of RESTful service',
    termsOfService: 'https://pallium.io/terms',
    contact: {
      name: 'Pallium Developer',
      email: 'dev@pallium.io',
      url: 'https://pallium.io'
    },
    license: {
      name: 'PRIVATE',
      url: 'https://pallium.io'
    }
  },
  servers: [
    {
      url: 'http://localhost:9000/v1',
      description: 'Local Server'
    },
    {
      url: 'https://gateway.pallium.io/api/v1',
      description: 'Production Server'
    }
  ],
  tags: [
    {
      name: 'User',
      description: 'User API'
    },
    {
      name: 'Config',
      description: 'Config API'
    }
  ],
  paths: {
    '/user/me': {
      get: getMe
    },
    '/user/login': {
      post: login
    },
    '/user/register': {
      post: register
    },
    '/user/logout': {
      get: logout
    },
    '/user/change-password': {
      put: changePassword
    },
    '/user/{id}': {
      get: getUser
    },
    '/user/all': {
      post: getUsers
    },
    '/user/info': {
      put: updateUserInfo
    },
    '/user/permission': {
      put: updateUserPermission
    },
    '/configs': {
      get: getConfig
    }
  },
  components: {
    securitySchemes: {
      Token: {
        type: 'apiKey',
        name: 'x-token',
        in: 'header'
      },
      RefreshToken: {
        type: 'apiKey',
        name: 'x-refresh-token',
        in: 'header'
      }
    },
    schemas: {
      loginBody,
      registerBody,
      changePasswordBody,
      getUsersBody,
      updateUserInfoBody,
      updateUserPermission,
      updateUserPermissionBody
    }
  }
};

export { apiDocumentation };
