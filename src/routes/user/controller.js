import { isValidObjectId } from 'mongoose';

import config from '../../configs';
import generateDS from '../../datasources';
import { USER_ROLE, SHARED_STATUS } from '../../configs/constant';
import { isObject } from '../../utils';
import { validateRegister, validateChangePassword, validateUpdateInfo, validateUpdatePermission } from './validation';

import {
  encryptPassword,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  validatePassword
} from '../../services/authenticate';

const { User } = generateDS;

export const getMe = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    const user = req.user;
    if (!user?._id) throw Error('Cannot authenticate user.');

    const doc = await User.findOneById(user._id, { ttl: config.cache.ttlId });
    result.data = doc;
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * GET: Detail a user
 */
export const getUser = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Success'
  };
  try {
    const doc = await User.findOneById(req.params.id, { ttl: config.cache.ttlId });
    if (isObject(doc)) {
      delete doc.password;
      delete doc.accessToken;
      delete doc.refreshToken;
    }
    result.data = doc;
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * GET: List user by query
 */
export const getUsers = async (req, res) => {
  let result = {
    statusCode: 200,
    message: 'Success',
    data: []
  };
  try {
    let { orderBy, where = {}, limit = 20, skip = 0 } = req.body;
    if (limit > config.limitQuerySize) limit = config.limitQuerySize;
    console.log('req.query: ', req.body);
    const { username, email, name, ...other } = where;
    const query = {
      status: { $ne: SHARED_STATUS.DELETED },
      ...other
    };

    if (name) {
      query.$or = [{ firstName: { $regex: name, $options: 'i' } }, { lastName: { $regex: name, $options: 'i' } }];
    }
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }

    const docs = await User.filterAndPaging(
      {
        orderBy,
        query,
        limit,
        skip
      },
      config.cache.ttlQuery
    );

    result = {
      ...result,
      ...docs
    };
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * POST: Login
 */
export const login = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Success'
  };

  try {
    const { username, password } = req.body;

    const existingUser = await User.collection.findOne({
      $or: [{ username }, { email: username }]
    });
    if (!existingUser) {
      throw new Error('User is not exist');
    }
    if (existingUser && existingUser.status !== SHARED_STATUS.ACTIVE) {
      throw new Error('User is not active');
    }

    const valid = comparePassword(existingUser.password, password);
    if (!valid) {
      throw new Error('Username or password invalid');
    }

    const userId = existingUser._id.toString();
    const newAccessToken = createAccessToken(existingUser);
    const newRefreshToken = createRefreshToken(existingUser);
    const doc = await User.update(
      {
        _id: userId,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        lastActivity: new Date()
      },
      config.cache.ttlId
    );

    const cacheAccessKeyToken = `${config.cache.authTokenPrefix}:${userId}:accessToken:${newAccessToken}`;
    const cacheRefreshKeyToken = `${config.cache.authTokenPrefix}:${userId}:refreshToken:${newRefreshToken}`;

    await User.saveCache(cacheAccessKeyToken, true, {
      ttl: config.jwt.expiration
    });
    await User.saveCache(cacheRefreshKeyToken, true, {
      ttl: config.jwt.expirationRefresh
    });

    result.data = doc;
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * POST: Register
 */
export const register = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Success'
  };

  try {
    const validateInput = await validateRegister(req.body);
    if (validateInput?.length) throw new Error(validateInput.map(item => item.message).join(','));

    const { username, email, password, role, ...info } = req.body;
    if ([USER_ROLE.ADMIN].includes(role)) throw new Error('You are not allowed in this role');

    const passwordValidationMessage = validatePassword(password);
    if (passwordValidationMessage) throw new Error(passwordValidationMessage);

    const existingUser = await User.collection.exists({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      throw new Error('Username or email already used');
    }
    const hashedPassword = encryptPassword(password);

    const doc = await User.create(
      {
        ...info,
        role,
        username,
        email,
        password: hashedPassword
      },
      config.cache.ttlId
    );
    if (doc) delete doc.password;

    result.data = doc;
  } catch (error) {
    console.log('error: ', error);
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * GET: Logout
 */
export const logout = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Success'
  };

  try {
    const user = req.user || {};
    const { refreshToken, accessToken } = user;
    await User.update(
      {
        _id: user._id,
        accessToken: null,
        refreshToken: null
      },
      config.cache.ttlId
    );

    if (req.body.resetAll === true) {
      // Logout all device/browser ~ all token
      const cacheKeyToken = `${config.cache.authTokenPrefix}:${user._id}`;
      await User.deleteManyCacheByPatternKey(cacheKeyToken);
    } else {
      // logout on 1 device/browser ~ 1 token
      const cacheAccessKeyToken = `${config.cache.authTokenPrefix}:${user._id}:accessToken:${accessToken}`;
      const cacheRefreshKeyToken = `${config.cache.authTokenPrefix}:${user._id}:refreshToken:${refreshToken}`;

      await User.delCache(cacheAccessKeyToken);
      await User.delCache(cacheRefreshKeyToken);
    }
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * PUT: Change password
 */
export const changePassword = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Updated Success'
  };
  try {
    const validateInput = await validateChangePassword(req.body);
    if (validateInput?.length) throw new Error(validateInput.map(item => item.message).join(','));

    const user = req.user;
    const { oldPassword, newPassword, resetAll } = req.body;

    const passwordValidationMessage = validatePassword(newPassword);
    if (passwordValidationMessage) throw new Error(passwordValidationMessage);

    if (oldPassword === newPassword) throw new Error('Password should be different');

    const existingUser = await User.collection.findOne({ _id: user._id });
    const valid = comparePassword(existingUser.password, oldPassword);
    if (!valid) throw new Error('Old password is incorrect');

    const userId = existingUser._id.toString();
    const hashedPassword = encryptPassword(newPassword);
    const doc = await User.update(
      {
        _id: userId,
        password: hashedPassword,
        updatedBy: userId,
        lastActivity: new Date(),
        lastPassDate: new Date()
      },
      config.cache.ttlId
    );

    if (resetAll === true) {
      // Logout all devices/browsers
      const cacheKeyToken = `${config.cache.authTokenPrefix}:${user._id}`;
      await User.deleteManyCacheByPatternKey(cacheKeyToken);
    }

    if (doc) delete doc.password;

    result.data = doc;
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * PUT: Update Info User
 */
export const updateInfoUser = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Updated Success'
  };
  try {
    const validateInput = await validateUpdateInfo(req.body);
    if (validateInput?.length) throw new Error(validateInput.map(item => item.message).join(','));

    if (!Object.entries(req.body).length) throw new Error('Require update field');
    const user = req.user;
    const doc = await User.update(
      { ...req.body, _id: user._id, updatedBy: user._id, lastActivity: new Date() },
      config.cache.ttlId
    );

    result.data = doc;
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * PUT: Update Permission
 */
export const updatePermission = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Updated Success'
  };
  try {
    const validateInput = await validateUpdatePermission(req.body);
    if (validateInput?.length) throw new Error(validateInput.map(item => item.message).join(','));
    if (!req.body.status && !req.body.role) throw new Error('Require update field');

    const user = req.user;
    const { userId, ...info } = req.body;

    if (!isValidObjectId(userId)) throw new Error('UserId invalid');
    const doc = await User.update(
      {
        ...info,
        _id: userId,
        accessToken: null,
        refreshToken: null,
        updatedBy: user._id
      },
      config.cache.ttlId
    );

    // Logout all devices/browsers
    const cacheKeyToken = `${config.cache.authTokenPrefix}:${userId}`;
    await User.deleteManyCacheByPatternKey(cacheKeyToken);

    result.data = doc;
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};

/*
 * DELETE: Delete User
 */
export const deleteUser = async (req, res) => {
  const result = {
    statusCode: 200,
    message: 'Removed Success'
  };
  try {
    const user = req.user;

    if (!isValidObjectId(req.params.id)) throw new Error('UserId invalid');
    await User.remove({ _id: req.params.id });
    console.log(`Admin (${user.username || user._id}) removed user id: ${req.params.id}`);

    // Logout all devices/browsers
    const cacheKeyToken = `${config.cache.authTokenPrefix}:${req.params.id}`;
    await User.deleteManyCacheByPatternKey(cacheKeyToken);
  } catch (error) {
    result.statusCode = 404;
    result.message = error.message;
  }
  return res.status(result.statusCode).json(result);
};
