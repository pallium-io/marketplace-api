import { encryptPassword } from '../services/authenticate';
import { USER_ROLE, SHARED_STATUS } from '../configs/constant';

export default async user => {
  const existDoc = await user.exists({ username: 'admin' });
  if (existDoc) {
    return null;
  }
  const input = {
    firstName: 'Kompa',
    lastName: 'Admin',
    username: 'admin',
    password: '123456',
    email: 'dev@kompa.ai',
    role: USER_ROLE.ADMIN,
    status: SHARED_STATUS.ACTIVE
  };
  input.password = encryptPassword(input.password);
  return user
    .create(input)
    .then(() => {
      console.log('Create admin successful!');
    })
    .catch(err => {
      console.error(err);
    });
};
