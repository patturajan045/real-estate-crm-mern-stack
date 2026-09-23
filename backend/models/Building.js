const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const buildingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    project: { type: String, ref: 'Project', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    totalFloors: { type: Number, default: 1, min: 1 },
    notes: { type: String, default: '' },
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'buildings',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.projectName = doc.project && typeof doc.project === 'object' && doc.project.name ? doc.project.name : '';
        if (doc.project && typeof doc.project === 'object') {
          ret.project = doc.project._id || doc.project.id;
        }
        if (ret.addedTime instanceof Date) ret.addedTime = ret.addedTime.toISOString();
        if (ret.updatedTime instanceof Date) ret.updatedTime = ret.updatedTime.toISOString();
        return ret;
      }
    }
  }
);

const Building = mongoose.model('Building', buildingSchema);
module.exports = Building;
