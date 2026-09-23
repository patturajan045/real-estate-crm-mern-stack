const Lead = require('../models/Lead');
const User = require('../models/User');
const { createFollowupNotification } = require('./notificationController');

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

async function createLead(req, res) {
  try {
    const data = { ...req.body };
    delete data.leadId;
    delete data.id;
    delete data._id;
    delete data.initialNote;

    if (!data.customerName || !data.email || !data.phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Customer name, email, and phone number are required.'
      });
    }

    if (data.assignedTo) {
      const user = await User.findById(data.assignedTo);
      if (!user) delete data.assignedTo;
    } else {
      delete data.assignedTo;
    }

    if (data.budgetMin !== undefined && data.budgetMin !== '') {
      data.budgetMin = parseFloat(data.budgetMin);
      if (isNaN(data.budgetMin)) delete data.budgetMin;
    } else {
      delete data.budgetMin;
    }

    if (data.budgetMax !== undefined && data.budgetMax !== '') {
      data.budgetMax = parseFloat(data.budgetMax);
      if (isNaN(data.budgetMax)) delete data.budgetMax;
    } else {
      delete data.budgetMax;
    }

    if (data.nextFollowUpDate) {
      data.nextFollowUpDate = new Date(data.nextFollowUpDate);
      if (isNaN(data.nextFollowUpDate.getTime())) delete data.nextFollowUpDate;
    } else {
      delete data.nextFollowUpDate;
    }

    const lead = await Lead.create(data);
    await lead.populate('assignedTo', 'name email');

    if (lead.assignedTo) {
      try {
        await createFollowupNotification({
          recipient: lead.assignedTo,
          assigner: req.userId,
          customerName: lead.customerName,
          entityType: 'lead',
          entityId: lead._id
        });
      } catch (e) {
        // Notification failure should not block lead creation
      }
    }

    return res.status(201).json({ status: 'success', data: lead.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to create lead.' });
  }
}

async function getLeads(req, res) {
  try {
    const { stage, assignedTo, search } = req.query;
    const filter = {};

    if (stage && stage !== 'All') {
      filter.stage = stage;
    }
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    if (search) {
      const reg = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { customerName: reg },
        { email: reg },
        { phoneNumber: reg }
      ];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ addedTime: -1 });

    return res.status(200).json({
      status: 'success',
      data: leads.map(l => l.toJSON())
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getLead(req, res) {
  try {
    const { lead_id } = req.params;
    const lead = await Lead.findById(lead_id).populate('assignedTo', 'name email');
    if (!lead) {
      return res.status(404).json({ status: 'error', message: 'Lead not found' });
    }
    return res.status(200).json({ status: 'success', data: lead.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function updateLead(req, res) {
  try {
    const { lead_id } = req.params;
    const data = req.body || {};

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ status: 'error', message: 'Lead not found' });
    }

    const prevAssignedId = lead.assignedTo ? String(lead.assignedTo) : null;
    const prevFollowupTime = lead.nextFollowUpDate ? lead.nextFollowUpDate.getTime() : null;

    const simpleFields = [
      'customerName', 'email', 'phoneNumber', 'address',
      'city', 'stage', 'source', 'preferredUnitType'
    ];
    for (const f of simpleFields) {
      if (data[f] !== undefined) lead[f] = data[f];
    }

    if (data.budgetMin !== undefined && data.budgetMin !== '') {
      const bMin = parseFloat(data.budgetMin);
      if (!isNaN(bMin)) lead.budgetMin = bMin;
    }
    if (data.budgetMax !== undefined && data.budgetMax !== '') {
      const bMax = parseFloat(data.budgetMax);
      if (!isNaN(bMax)) lead.budgetMax = bMax;
    }

    if (data.assignedTo !== undefined) {
      if (!data.assignedTo) {
        lead.assignedTo = null;
      } else {
        const user = await User.findById(data.assignedTo);
        if (user) lead.assignedTo = user._id;
      }
    }

    if (data.nextFollowUpDate !== undefined) {
      if (!data.nextFollowUpDate) {
        lead.nextFollowUpDate = null;
      } else {
        const d = new Date(data.nextFollowUpDate);
        if (!isNaN(d.getTime())) lead.nextFollowUpDate = d;
      }
    }

    await lead.save();
    await lead.populate('assignedTo', 'name email');

    // In-App Notification if assigned or follow-up changed
    if (lead.assignedTo) {
      const currAssignedId = String(lead.assignedTo._id || lead.assignedTo);
      const currFollowupTime = lead.nextFollowUpDate ? lead.nextFollowUpDate.getTime() : null;
      const isNewAssignment = currAssignedId !== prevAssignedId;
      const isNewFollowup = currFollowupTime !== null && currFollowupTime !== prevFollowupTime;

      if (isNewAssignment || isNewFollowup) {
        try {
          await createFollowupNotification({
            recipient: lead.assignedTo,
            assigner: req.userId,
            customerName: lead.customerName,
            entityType: 'lead',
            entityId: lead._id
          });
        } catch (e) {}
      }
    }

    return res.status(200).json({ status: 'success', data: lead.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function deleteLead(req, res) {
  try {
    const { lead_id } = req.params;
    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ status: 'error', message: 'Lead not found' });
    }
    await lead.deleteOne();
    return res.status(200).json({ status: 'success', message: 'Lead deleted successfully' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function addLeadNote(req, res) {
  try {
    const { lead_id } = req.params;
    const data = req.body || {};

    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({ status: 'error', message: 'Lead not found' });
    }

    const noteContent = data.content || '';
    lead.notes.push({
      authorId: data.authorId || 'system',
      authorName: data.authorName || 'Agent',
      content: noteContent,
      addedTime: new Date()
    });

    let followUpUpdated = false;
    if (data.nextFollowUpDate) {
      const newDate = new Date(data.nextFollowUpDate);
      if (!isNaN(newDate.getTime())) {
        const prevTime = lead.nextFollowUpDate ? lead.nextFollowUpDate.getTime() : null;
        if (prevTime !== newDate.getTime()) {
          lead.nextFollowUpDate = newDate;
          followUpUpdated = true;
        }
      }
    }

    if (data.stage && Lead.STAGES.includes(data.stage)) {
      lead.stage = data.stage;
    }

    await lead.save();
    await lead.populate('assignedTo', 'name email');

    if (followUpUpdated && lead.assignedTo) {
      try {
        await createFollowupNotification({
          recipient: lead.assignedTo,
          assigner: req.userId,
          customerName: lead.customerName,
          entityType: 'lead',
          entityId: lead._id,
          note: noteContent
        });
      } catch (e) {}
    }

    return res.status(201).json({ status: 'success', data: lead.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  addLeadNote
};
