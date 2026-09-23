const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ROLES = ['Super Admin', 'Admin', 'Sales Employee'];

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, default: '', maxlength: 20 },
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'Sales Employee' },
    isActive: { type: Boolean, default: true },
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.is_active = ret.isActive;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        if (ret.addedTime instanceof Date) ret.addedTime = ret.addedTime.toISOString();
        if (ret.updatedTime instanceof Date) ret.updatedTime = ret.updatedTime.toISOString();
        return ret;
      }
    }
  }
);

userSchema.statics.ROLES = ROLES;
userSchema.statics.ROLE_SUPER_ADMIN = 'Super Admin';
userSchema.statics.ROLE_ADMIN = 'Admin';
userSchema.statics.ROLE_SALES = 'Sales Employee';

const User = mongoose.model('User', userSchema);
module.exports = User;
