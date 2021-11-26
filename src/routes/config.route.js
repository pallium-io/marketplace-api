import { Router } from 'express';

import { USER_ROLE, SHARED_STATUS, SORT_TYPE } from '../configs/constant';

const router = Router();

export default () => {
  router.get('/configs', (req, res) => {
    const result = {
      statusCode: 200,
      message: 'Success'
    };
    try {
      result.data = {
        role: USER_ROLE,
        status: SHARED_STATUS,
        sortType: SORT_TYPE
      };
    } catch (error) {
      result.statusCode = 404;
      result.message = error.message;
    }
    return res.status(result.statusCode).json(result);
  });

  return router;
};
