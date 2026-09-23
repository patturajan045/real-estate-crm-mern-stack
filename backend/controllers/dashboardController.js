const Lead = require('../models/Lead');
const Booking = require('../models/Booking');
const Unit = require('../models/Unit');
const Project = require('../models/Project');

async function getDashboardStats(req, res) {
  try {
    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // 1. Leads Stats
    const totalLeads = await Lead.countDocuments();
    const leadsByStage = {
      'New': 0,
      'Contacted': 0,
      'Site Visit': 0,
      'Interested': 0,
      'Negotiation': 0,
      'Booked': 0,
      'Lost': 0
    };

    const allLeadsStages = await Lead.find({}, 'stage');
    for (const l of allLeadsStages) {
      if (leadsByStage[l.stage] !== undefined) {
        leadsByStage[l.stage]++;
      }
    }

    // 2. Follow-ups Stats
    const activeLeads = await Lead.find({
      stage: { $nin: ['Booked', 'Lost'] },
      nextFollowUpDate: { $ne: null }
    }).populate('assignedTo', 'name');

    const overdueFollowups = [];
    const todayFollowups = [];
    const upcomingFollowups = [];

    for (const l of activeLeads) {
      if (!l.nextFollowUpDate) continue;
      const fDate = new Date(l.nextFollowUpDate);
      const item = {
        id: String(l._id),
        customerName: l.customerName,
        phoneNumber: l.phoneNumber,
        email: l.email,
        stage: l.stage,
        nextFollowUpDate: fDate.toISOString(),
        assignedToName: l.assignedTo && l.assignedTo.name ? l.assignedTo.name : 'Unassigned'
      };

      if (fDate < todayStart) {
        overdueFollowups.push(item);
      } else if (fDate >= todayStart && fDate <= todayEnd) {
        todayFollowups.push(item);
      } else {
        upcomingFollowups.push(item);
      }
    }

    overdueFollowups.sort((a, b) => new Date(a.nextFollowUpDate) - new Date(b.nextFollowUpDate));
    todayFollowups.sort((a, b) => new Date(a.nextFollowUpDate) - new Date(b.nextFollowUpDate));
    upcomingFollowups.sort((a, b) => new Date(a.nextFollowUpDate) - new Date(b.nextFollowUpDate));

    // 3. Property & Units Stats
    const totalProjects = await Project.countDocuments();
    const totalUnits = await Unit.countDocuments();
    const unitsByStatus = {
      'Available': 0,
      'Blocked': 0,
      'Booked': 0,
      'Sold': 0
    };

    const allUnitsStatus = await Unit.find({}, 'status');
    for (const u of allUnitsStatus) {
      if (unitsByStatus[u.status] !== undefined) {
        unitsByStatus[u.status]++;
      }
    }

    // 4. Bookings & Financials Stats
    const confirmedBookings = await Booking.find({ status: 'Confirmed' });
    const totalBookings = confirmedBookings.length;
    let totalRevenue = 0;
    let totalAdvanceCollected = 0;
    for (const b of confirmedBookings) {
      totalRevenue += b.agreementValue || 0;
      totalAdvanceCollected += b.bookingAmount || 0;
    }

    // 5. Recent Activity
    const recentLeadsRaw = await Lead.find().populate('assignedTo', 'name email').sort({ addedTime: -1 }).limit(5);
    const recentLeads = recentLeadsRaw.map(l => l.toJSON());

    const recentBookingsRaw = await Booking.find()
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
      .sort({ bookingDate: -1 })
      .limit(5);

    const recentBookings = recentBookingsRaw.map(b => b.toJSON());

    return res.status(200).json({
      status: 'success',
      data: {
        counts: {
          totalLeads,
          totalProjects,
          totalUnits,
          availableUnits: unitsByStatus['Available'] || 0,
          totalBookings,
          totalRevenue,
          totalAdvanceCollected,
          todayFollowupsCount: todayFollowups.length,
          overdueFollowupsCount: overdueFollowups.length
        },
        leadsByStage,
        unitsByStatus,
        followups: {
          today: todayFollowups,
          overdue: overdueFollowups,
          upcoming: upcomingFollowups.slice(0, 10)
        },
        recentLeads,
        recentBookings
      }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  getDashboardStats
};
