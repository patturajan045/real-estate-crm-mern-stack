const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STAGES = ['New', 'Contacted', 'Site Visit', 'Interested', 'Negotiation', 'Booked', 'Lost'];

const leadNoteSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => uuidv4() },
    authorId: { type: String, required: true },
    authorName: { type: String, default: 'Agent' },
    content: { type: String, required: true },
    addedTime: { type: Date, default: Date.now }
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    customerName: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 20 },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    stage: { type: String, enum: STAGES, default: 'New' },
    source: { type: String, default: 'Website' },
    budgetMin: { type: Number, default: 0.0 },
    budgetMax: { type: Number },
    assignedTo: { type: String, ref: 'User', default: null },
    nextFollowUpDate: { type: Date, default: null },
    preferredUnitType: { type: String },
    interestedUnits: [{ type: String, ref: 'Unit' }],
    notes: [leadNoteSchema],
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'leads',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.assignedToName = doc.assignedTo && typeof doc.assignedTo === 'object' && doc.assignedTo.name ? doc.assignedTo.name : '';
        ret.assignedToEmail = doc.assignedTo && typeof doc.assignedTo === 'object' && doc.assignedTo.email ? doc.assignedTo.email : '';
        if (doc.assignedTo && typeof doc.assignedTo === 'object') {
          ret.assignedTo = doc.assignedTo._id || doc.assignedTo.id;
        }
        if (Array.isArray(ret.notes)) {
          ret.notes = ret.notes.map(n => ({
            id: n.id,
            authorId: n.authorId,
            authorName: n.authorName,
            content: n.content,
            addedTime: n.addedTime instanceof Date ? n.addedTime.toISOString() : n.addedTime
          }));
        }
        if (ret.nextFollowUpDate instanceof Date) ret.nextFollowUpDate = ret.nextFollowUpDate.toISOString();
        if (ret.addedTime instanceof Date) ret.addedTime = ret.addedTime.toISOString();
        if (ret.updatedTime instanceof Date) ret.updatedTime = ret.updatedTime.toISOString();
        return ret;
      }
    }
  }
);

leadSchema.statics.STAGES = STAGES;
leadSchema.statics.STAGE_NEW = 'New';
leadSchema.statics.STAGE_CONTACTED = 'Contacted';
leadSchema.statics.STAGE_SITE_VISIT = 'Site Visit';
leadSchema.statics.STAGE_INTERESTED = 'Interested';
leadSchema.statics.STAGE_NEGOTIATION = 'Negotiation';
leadSchema.statics.STAGE_BOOKED = 'Booked';
leadSchema.statics.STAGE_LOST = 'Lost';

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
