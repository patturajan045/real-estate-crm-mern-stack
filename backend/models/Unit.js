const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UNIT_TYPES = ['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Villa', 'Commercial'];
const STATUS_CHOICES = ['Available', 'Blocked', 'Booked', 'Sold'];

const unitSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    project: { type: String, ref: 'Project', required: true },
    building: { type: String, ref: 'Building', required: true },
    unitNumber: { type: String, required: true, trim: true, maxlength: 50 },
    floor: { type: Number, required: true },
    unitType: { type: String, enum: UNIT_TYPES, default: '2BHK' },
    carpetAreaSqFt: { type: Number, required: true },
    superBuiltUpAreaSqFt: { type: Number },
    price: { type: Number, required: true, min: 0.0 },
    status: { type: String, enum: STATUS_CHOICES, default: 'Available' },
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'units',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.projectName = doc.project && typeof doc.project === 'object' && doc.project.name ? doc.project.name : '';
        ret.buildingName = doc.building && typeof doc.building === 'object' && doc.building.name ? doc.building.name : '';
        if (doc.project && typeof doc.project === 'object') ret.project = doc.project._id || doc.project.id;
        if (doc.building && typeof doc.building === 'object') ret.building = doc.building._id || doc.building.id;
        if (ret.addedTime instanceof Date) ret.addedTime = ret.addedTime.toISOString();
        if (ret.updatedTime instanceof Date) ret.updatedTime = ret.updatedTime.toISOString();
        return ret;
      }
    }
  }
);

unitSchema.index({ building: 1, unitNumber: 1 });
unitSchema.statics.UNIT_TYPES = UNIT_TYPES;
unitSchema.statics.STATUS_CHOICES = STATUS_CHOICES;
unitSchema.statics.STATUS_AVAILABLE = 'Available';
unitSchema.statics.STATUS_BLOCKED = 'Blocked';
unitSchema.statics.STATUS_BOOKED = 'Booked';
unitSchema.statics.STATUS_SOLD = 'Sold';

const Unit = mongoose.model('Unit', unitSchema);
module.exports = Unit;
