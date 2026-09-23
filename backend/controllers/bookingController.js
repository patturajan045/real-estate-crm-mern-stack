const Booking = require('../models/Booking');
const Lead = require('../models/Lead');
const Unit = require('../models/Unit');
const User = require('../models/User');
const { createFollowupNotification } = require('./notificationController');

async function createBooking(req, res) {
  let unitReserved = false;
  let unit_id = null;

  try {
    const data = req.body || {};
    unit_id = data.unit;
    const lead_id = data.lead;
    const booked_by_id = data.bookedBy;

    if (!unit_id || !lead_id) {
      return res.status(400).json({ status: 'error', message: 'Lead and Unit are required' });
    }

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ status: 'error', message: 'Referenced Lead not found' });
    }

    const unit = await Unit.findById(unit_id);
    if (!unit) {
      return res.status(404).json({ status: 'error', message: 'Referenced Unit not found' });
    }

    let booked_by_user = null;
    if (booked_by_id) {
      booked_by_user = await User.findById(booked_by_id);
    }
    if (!booked_by_user && lead.assignedTo) {
      booked_by_user = await User.findById(lead.assignedTo);
    }
    if (!booked_by_user) {
      booked_by_user = await User.findOne();
    }

    // ATOMIC CONCURRENCY GUARD:
    // Atomic check and update ensures two concurrent users cannot book the same unit.
    const updateResult = await Unit.updateOne(
      { _id: unit_id, status: Unit.STATUS_AVAILABLE },
      { $set: { status: Unit.STATUS_BOOKED } }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(409).json({
        status: 'error',
        message: `Double booking prevented! Unit '${unit.unitNumber}' is not available (already booked or sold).`
      });
    }

    unitReserved = true;

    const agreementVal = parseFloat(data.agreementValue !== undefined ? data.agreementValue : unit.price) || 0;
    const bookingAmt = parseFloat(data.bookingAmount !== undefined ? data.bookingAmount : 0) || 0;

    const booking = await Booking.create({
      lead: lead._id,
      unit: unit._id,
      bookedBy: booked_by_user ? booked_by_user._id : null,
      agreementValue: agreementVal,
      bookingAmount: bookingAmt,
      paymentMethod: data.paymentMethod || 'Bank Transfer',
      transactionReference: data.transactionReference || '',
      status: Booking.STATUS_CONFIRMED
    });

    // Update lead stage to Booked
    lead.stage = Lead.STAGE_BOOKED;
    await lead.save();

    // In-App Notification
    try {
      const notifyTarget = booked_by_user || (lead.assignedTo ? await User.findById(lead.assignedTo) : null);
      if (notifyTarget) {
        await createFollowupNotification({
          recipient: notifyTarget,
          assigner: req.userId,
          customerName: lead.customerName,
          entityType: 'booking',
          entityId: booking._id,
          note: `Unit ${unit.unitNumber} booked.`
        });
      }
    } catch (e) {}

    await booking.populate([
      { path: 'lead', select: 'customerName phoneNumber email' },
      {
        path: 'unit',
        select: 'unitNumber unitType price building project',
        populate: [
          { path: 'building', select: 'name' },
          { path: 'project', select: 'name' }
        ]
      },
      { path: 'bookedBy', select: 'name' }
    ]);

    return res.status(201).json({ status: 'success', data: booking.toJSON() });

  } catch (err) {
    if (unitReserved && unit_id) {
      // Rollback unit status back to Available
      await Unit.updateOne({ _id: unit_id }, { $set: { status: Unit.STATUS_AVAILABLE } });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'A confirmed booking already exists for this unit.'
      });
    }

    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getBookings(req, res) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('lead', 'customerName phoneNumber email')
      .populate({
        path: 'unit',
        select: 'unitNumber unitType building project',
        populate: [
          { path: 'building', select: 'name' },
          { path: 'project', select: 'name' }
        ]
      })
      .populate('bookedBy', 'name')
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      status: 'success',
      data: bookings.map(b => b.toJSON())
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getBooking(req, res) {
  try {
    const { booking_id } = req.params;
    const booking = await Booking.findById(booking_id)
      .populate('lead', 'customerName phoneNumber email')
      .populate({
        path: 'unit',
        select: 'unitNumber unitType building project',
        populate: [
          { path: 'building', select: 'name' },
          { path: 'project', select: 'name' }
        ]
      })
      .populate('bookedBy', 'name');

    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    return res.status(200).json({ status: 'success', data: booking.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function cancelBooking(req, res) {
  try {
    const { booking_id } = req.params;
    const data = req.body || {};

    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found' });
    }

    if (booking.status === Booking.STATUS_CANCELLED) {
      return res.status(400).json({ status: 'error', message: 'Booking is already cancelled' });
    }

    booking.status = Booking.STATUS_CANCELLED;
    booking.cancellationReason = data.cancellationReason || 'Cancelled by user';
    await booking.save();

    // Atomically release unit back to Available
    if (booking.unit) {
      const unitId = typeof booking.unit === 'object' ? (booking.unit._id || booking.unit.id) : booking.unit;
      await Unit.updateOne({ _id: unitId }, { $set: { status: Unit.STATUS_AVAILABLE } });
    }

    await booking.populate([
      { path: 'lead', select: 'customerName phoneNumber email' },
      {
        path: 'unit',
        select: 'unitNumber unitType building project',
        populate: [
          { path: 'building', select: 'name' },
          { path: 'project', select: 'name' }
        ]
      },
      { path: 'bookedBy', select: 'name' }
    ]);

    return res.status(200).json({ status: 'success', data: booking.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking
};
