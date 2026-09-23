const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const STATUS_CHOICES = ['Pending', 'Confirmed', 'Cancelled'];

function generateBookingNumber() {
  const d = new Date();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hexPart = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `BK-${year}${month}${day}-${hexPart}`;
}

const bookingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    bookingNumber: { type: String, unique: true, default: generateBookingNumber },
    lead: { type: String, ref: 'Lead', required: true },
    unit: { type: String, ref: 'Unit', required: true },
    bookedBy: { type: String, ref: 'User', required: true },
    agreementValue: { type: Number, required: true, min: 0.0 },
    bookingAmount: { type: Number, required: true, min: 0.0 },
    paymentMethod: { type: String, default: 'Wire Transfer' },
    transactionReference: { type: String, default: '' },
    status: { type: String, enum: STATUS_CHOICES, default: 'Confirmed' },
    cancellationReason: { type: String, default: '' },
    bookingDate: { type: Date, default: Date.now },
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'bookings',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        // Populated lead details
        ret.leadName = '';
        ret.leadPhone = '';
        ret.leadEmail = '';
        if (doc.lead && typeof doc.lead === 'object') {
          ret.leadName = doc.lead.customerName || '';
          ret.leadPhone = doc.lead.phoneNumber || '';
          ret.leadEmail = doc.lead.email || '';
          ret.lead = doc.lead._id || doc.lead.id;
        }

        // Populated unit details
        ret.unitNumber = '';
        ret.unitType = '';
        ret.buildingName = '';
        ret.projectName = '';
        if (doc.unit && typeof doc.unit === 'object') {
          ret.unitNumber = doc.unit.unitNumber || '';
          ret.unitType = doc.unit.unitType || '';
          if (doc.unit.building && typeof doc.unit.building === 'object') {
            ret.buildingName = doc.unit.building.name || '';
          }
          if (doc.unit.project && typeof doc.unit.project === 'object') {
            ret.projectName = doc.unit.project.name || '';
          }
          ret.unit = doc.unit._id || doc.unit.id;
        }

        // Populated bookedBy user details
        ret.bookedByName = '';
        if (doc.bookedBy && typeof doc.bookedBy === 'object') {
          ret.bookedByName = doc.bookedBy.name || '';
          ret.bookedBy = doc.bookedBy._id || doc.bookedBy.id;
        }

        if (ret.bookingDate instanceof Date) ret.bookingDate = ret.bookingDate.toISOString();
        if (ret.addedTime instanceof Date) ret.addedTime = ret.addedTime.toISOString();
        if (ret.updatedTime instanceof Date) ret.updatedTime = ret.updatedTime.toISOString();
        return ret;
      }
    }
  }
);

bookingSchema.index(
  { unit: 1 },
  {
    name: 'unique_active_unit_booking',
    unique: true,
    partialFilterExpression: { status: { $in: ['Confirmed', 'Pending'] } }
  }
);

bookingSchema.statics.STATUS_PENDING = 'Pending';
bookingSchema.statics.STATUS_CONFIRMED = 'Confirmed';
bookingSchema.statics.STATUS_CANCELLED = 'Cancelled';
bookingSchema.statics.STATUS_CHOICES = STATUS_CHOICES;

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
