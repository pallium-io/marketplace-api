import Validator from 'fastest-validator';
import { USER_ROLE, SHARED_STATUS } from '../../configs/constant';

const v = new Validator();
export const validateRegister = v.compile({
  $$strict: true, // no additional properties allowed

  username: { type: 'string', min: 3, max: 30, trim: true, lowercase: true, pattern: '^[a-zA-Z0-9_.-]*$' },
  email: { type: 'email' },
  password: { type: 'string', min: 6 },

  firstName: { type: 'string', min: 1, max: 30, optional: true },
  lastName: { type: 'string', min: 1, max: 30, optional: true },
  phoneNumber: { type: 'string', min: 10, optional: true },
  role: {
    type: 'enum',
    values: Object.values(USER_ROLE)
  },
  status: {
    type: 'enum',
    values: Object.values(SHARED_STATUS),
    optional: true
  },
  avatar: {
    type: 'url',
    optional: true
  }
});

export const validateChangePassword = v.compile({
  $$strict: true, // no additional properties allowed

  oldPassword: { type: 'string', min: 6 },
  newPassword: { type: 'string', min: 6 },
  resetAll: { type: 'boolean', optional: true }
});

export const validateUpdateInfo = new Validator().compile({
  $$strict: true, // no additional properties allowed

  firstName: { type: 'string', min: 1, max: 30, optional: true },
  lastName: { type: 'string', min: 1, max: 30, optional: true },
  phoneNumber: { type: 'string', min: 10, optional: true },
  avatar: {
    type: 'url',
    optional: true
  }
});

export const validateUpdatePermission = v.compile({
  $$strict: true, // no additional properties allowed

  userId: {
    type: 'string'
  },
  role: {
    type: 'enum',
    values: Object.values(USER_ROLE),
    optional: true
  },
  status: {
    type: 'enum',
    values: Object.values(SHARED_STATUS),
    optional: true
  }
});
