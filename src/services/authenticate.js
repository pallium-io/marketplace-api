import bcrypt from 'bcryptjs';
import jwt, { sign } from 'jsonwebtoken';
import RedisCache from '../external-libs/redis';
import config from '../configs';

const isInvalidPrefix = prefix => prefix !== config.jwt.prefix;
const isEmptyToken = token => token === undefined;

const getPayload = token => {
  if (token && typeof token === 'string') {
    const [prefix, payload] = token.split(' ');
    if (isEmptyToken(payload)) return null;
    if (isInvalidPrefix(prefix)) return null;
    return payload;
  }
  return null;
};

const getTokenFromRequest = headers => {
  const token = headers[config.jwt.header];
  const refreshToken = headers[config.jwt.headerRefresh];
  return [getPayload(token), getPayload(refreshToken)];
};

export const setHeader = (res, accessToken, refreshToken) => {
  res.set('Access-Control-Expose-Headers', `${config.jwt.header}, ${config.jwt.headerRefresh}`);
  res.set(config.jwt.header, accessToken);
  res.set(config.jwt.headerRefresh, refreshToken);
};

const isActiveUser = async user => {
  if (!RedisCache) {
    throw new Error('Cannot Authenticate User Request');
  }
  try {
    const accessTokenValue = await RedisCache.exists(
      `${config.cache.authTokenPrefix}:${user._id}:accessToken:${user.accessToken}`
    );
    if (accessTokenValue) return true;
    const refreshTokenValue = await RedisCache.exists(
      `${config.cache.authTokenPrefix}:${user._id}:refreshToken:${user.refreshToken}`
    );
    if (refreshTokenValue) return true;
    return false;
  } catch (error) {
    return false;
  }
};

const encryptPassword = password => {
  try {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    console.error(error);
    throw new Error('Have an error. Please try again!');
  }
};

const comparePassword = (currentPassword, candidatePassword) => bcrypt.compareSync(candidatePassword, currentPassword);

const createAccessToken = ({ _id, username, role, status }) =>
  sign({ _id, username, role, status }, config.jwt.secret, {
    expiresIn: config.jwt.expiration
  });

const createRefreshToken = ({ _id, username, role, status }) =>
  sign({ _id, username, role, status }, config.jwt.secretRefresh, {
    expiresIn: config.jwt.expirationRefresh
  });

const validatePassword = password => {
  if (!password) return 'Password required';
  if (password.length < 6) return 'Passwords must be at least 6 characters in length';
  return null;
};

const handleUserAuthenticate = (req, res, next) => {
  const [accessToken, refreshToken] = getTokenFromRequest(req.headers);
  if (!accessToken) return next();
  // Verify AccessToken
  return jwt.verify(accessToken, config.jwt.secret, async (err, user) => {
    if (user && user._id) {
      // Check User is active
      const isActive = await isActiveUser({ ...user, accessToken });
      req.user = isActive ? { ...user, refreshToken, accessToken } : null;
      return next();
    }
    if (err.name === 'TokenExpiredError' && refreshToken) {
      // Verify RefreshToken when AccessToken expired
      return jwt.verify(refreshToken, config.jwt.secretRefresh, async (refreshTokenErr, refreshTokenDecoded) => {
        if (refreshTokenErr) {
          return next();
        }

        // Check User is active
        const isActive = await isActiveUser({ ...refreshTokenDecoded, refreshToken });
        if (!isActive) return next();

        // Sign New Token
        const newAccessToken = createAccessToken(refreshTokenDecoded);
        const newRefreshToken = createRefreshToken(refreshTokenDecoded);

        const accessTokenKey = `${config.cache.authTokenPrefix}:${refreshTokenDecoded._id}:accessToken:${newAccessToken}`;
        const refreshTokenKey = `${config.cache.authTokenPrefix}:${refreshTokenDecoded._id}:refreshToken:${newRefreshToken}`;

        // Remove Cache Old RefreshToken
        const oldRefreshTokenKey = `${config.cache.authTokenPrefix}:${refreshTokenDecoded._id}:refreshToken:${refreshToken}`;
        await RedisCache.del(oldRefreshTokenKey);

        // Cache New Token with expiration time
        await RedisCache.set(accessTokenKey, 'true', 'ex', config.jwt.expiration);
        await RedisCache.set(refreshTokenKey, 'true', 'ex', config.jwt.expirationRefresh);

        // Set Header New Token
        setHeader(res, newAccessToken, newRefreshToken);
        req.user = { ...refreshTokenDecoded, refreshToken: newRefreshToken, accessToken: newAccessToken };
        return next();
      });
    }
    return next();
  });
};

export {
  encryptPassword,
  comparePassword,
  createAccessToken,
  createRefreshToken,
  validatePassword,
  handleUserAuthenticate,
  isActiveUser
};
