const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUS_CHOICES = ['Planning', 'Under Construction', 'Ready to Move'];

const projectSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true, unique: true, maxlength: 150, trim: true },
    description: { type: String, default: '' },
    builder: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    status: { type: String, enum: STATUS_CHOICES, default: 'Under Construction' },
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'projects',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.addedTime instanceof Date) ret.addedTime = ret.addedTime.toISOString();
        if (ret.updatedTime instanceof Date) ret.updatedTime = ret.updatedTime.toISOString();
        return ret;
      }
    }
  }
);

projectSchema.statics.STATUS_CHOICES = STATUS_CHOICES;

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
