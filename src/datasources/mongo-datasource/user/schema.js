import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import generateModel from '../../generates/generateModel';

const schema = {
  username: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: [true, 'Username required'],
    minlength: [5, 'Minimun name length 5 characters'],
    maxlength: [50, 'Minimun name length 50 characters']
  },
  password: {
    type: String,
    required: [true, 'Password required']
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'Email required'],
    validate: [isEmail, 'Invalid email']
  },
  phoneNumber: {
    type: String,
    minlength: [10, 'Minimun phone length 10 characters'],
    validate: [isMobilePhone, 'Invalid phone number']
  },
  firstName: {
    type: String,
    minlength: [1, 'Minimun name length 1 characters']
  },
  lastName: {
    type: String,
    minlength: [1, 'Minimun name length 1 characters']
  },
  avatar: String,
  role: {
    type: Number,
    required: [true, 'Role required']
  },
  status: {
    type: Number,
    default: 1
  },
  accessToken: String,
  refreshToken: String,
  expiresDate: Date,
  lastPassDate: Date,
  lastActivity: Date,
  createdBy: String,
  updatedBy: String
};

export default generateModel({
  schema,
  modelName: 'User',
  collectionName: 'users'
});
