import { Router } from 'express';
import permit from '../../utils/authorization';
import { USER_ROLE } from '../../configs/constant';
import {
  getMe,
  getUser,
  getUsers,
  login,
  register,
  logout,
  changePassword,
  updateInfoUser,
  updatePermission,
  deleteUser
} from './controller';

const router = Router();

export default () => {
  router.get('/user/me', permit({ isAuthenticated: true }), getMe);

  router.get(
    '/user/:id',
    permit({ isAuthenticated: true, permittedRoles: [USER_ROLE.ADMIN, USER_ROLE.MANAGER] }),
    getUser
  );

  router.post(
    '/user/all',
    permit({ isAuthenticated: true, permittedRoles: [USER_ROLE.ADMIN, USER_ROLE.MANAGER] }),
    getUsers
  );

  router.post('/user/login', login);

  router.post(
    '/user/register',
    permit({ isAuthenticated: true, permittedRoles: [USER_ROLE.ADMIN, USER_ROLE.MANAGER] }),
    register
  );

  router.get('/user/logout', permit({ isAuthenticated: true }), logout);

  router.put('/user/change-password', permit({ isAuthenticated: true }), changePassword);

  router.put('/user/info', permit({ isAuthenticated: true }), updateInfoUser);

  router.put(
    '/user/permission',
    permit({ isAuthenticated: true, permittedRoles: [USER_ROLE.ADMIN, USER_ROLE.MANAGER] }),
    updatePermission
  );

  router.delete(
    '/user/:id',
    permit({ isAuthenticated: true, permittedRoles: [USER_ROLE.ADMIN, USER_ROLE.MANAGER] }),
    deleteUser
  );

  return router;
};
