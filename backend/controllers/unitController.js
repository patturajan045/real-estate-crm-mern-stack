const Unit = require('../models/Unit');
const Project = require('../models/Project');
const Building = require('../models/Building');

async function createUnit(req, res) {
  try {
    const data = { ...req.body };
    delete data.unitId;
    delete data.id;
    delete data._id;

    if (!data.unitNumber) {
      return res.status(400).json({ status: 'error', message: 'Unit number is required.' });
    }

    if (data.project) {
      const proj = await Project.findById(data.project);
      if (!proj) {
        return res.status(404).json({ status: 'error', message: 'Referenced Project not found.' });
      }
    }

    if (data.building) {
      const bld = await Building.findById(data.building);
      if (!bld) {
        return res.status(404).json({ status: 'error', message: 'Referenced Building not found.' });
      }
    }

    if (data.floor !== undefined) data.floor = parseInt(data.floor, 10) || 1;
    if (data.carpetAreaSqFt !== undefined) data.carpetAreaSqFt = parseFloat(data.carpetAreaSqFt) || 0.0;
    if (data.price !== undefined) data.price = parseFloat(data.price) || 0.0;

    const existing = await Unit.findOne({ building: data.building, unitNumber: data.unitNumber });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'A unit with this number already exists in this building.' });
    }

    const unit = await Unit.create(data);
    await unit.populate([
      { path: 'project', select: 'name' },
      { path: 'building', select: 'name' }
    ]);

    return res.status(201).json({ status: 'success', data: unit.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to create unit.' });
  }
}

async function getAllUnits(req, res) {
  try {
    const { project_id, building_id, status, unit_type } = req.query;
    const filter = {};

    if (project_id) filter.project = project_id;
    if (building_id) filter.building = building_id;
    if (status && status !== 'All') filter.status = status;
    if (unit_type && unit_type !== 'All') filter.unitType = unit_type;

    const units = await Unit.find(filter)
      .populate('project', 'name')
      .populate('building', 'name')
      .sort({ floor: 1, unitNumber: 1 });

    return res.status(200).json({ status: 'success', data: units.map(u => u.toJSON()) });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch units.' });
  }
}

async function getUnits(req, res) {
  try {
    const { building_id } = req.params;
    const units = await Unit.find({ building: building_id })
      .populate('project', 'name')
      .populate('building', 'name')
      .sort({ floor: 1, unitNumber: 1 });

    return res.status(200).json({ status: 'success', data: units.map(u => u.toJSON()) });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch building units.' });
  }
}

async function getUnit(req, res) {
  try {
    const { unit_id } = req.params;
    const unit = await Unit.findById(unit_id)
      .populate('project', 'name')
      .populate('building', 'name');

    if (!unit) {
      return res.status(404).json({ status: 'error', message: 'Unit not found.' });
    }
    return res.status(200).json({ status: 'success', data: unit.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve unit.' });
  }
}

async function updateUnit(req, res) {
  try {
    const { unit_id } = req.params;
    const data = { ...req.body };
    delete data.unitId;
    delete data.id;
    delete data._id;

    const unit = await Unit.findById(unit_id);
    if (!unit) {
      return res.status(404).json({ status: 'error', message: 'Unit not found.' });
    }

    if (data.project) {
      const proj = await Project.findById(data.project);
      if (proj) unit.project = proj._id;
      delete data.project;
    }
    if (data.building) {
      const bld = await Building.findById(data.building);
      if (bld) unit.building = bld._id;
      delete data.building;
    }

    if (data.floor !== undefined) {
      unit.floor = parseInt(data.floor, 10) || 1;
      delete data.floor;
    }
    if (data.carpetAreaSqFt !== undefined) {
      unit.carpetAreaSqFt = parseFloat(data.carpetAreaSqFt) || 0.0;
      delete data.carpetAreaSqFt;
    }
    if (data.price !== undefined) {
      unit.price = parseFloat(data.price) || 0.0;
      delete data.price;
    }

    Object.assign(unit, data);
    await unit.save();
    await unit.populate([
      { path: 'project', select: 'name' },
      { path: 'building', select: 'name' }
    ]);

    return res.status(200).json({ status: 'success', data: unit.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to update unit.' });
  }
}

async function updateUnitStatus(req, res) {
  try {
    const { unit_id } = req.params;
    const { status } = req.body || {};

    const unit = await Unit.findById(unit_id);
    if (!unit) {
      return res.status(404).json({ status: 'error', message: 'Unit not found.' });
    }

    if (status && Unit.STATUS_CHOICES.includes(status)) {
      unit.status = status;
      await unit.save();
    }
    await unit.populate([
      { path: 'project', select: 'name' },
      { path: 'building', select: 'name' }
    ]);

    return res.status(200).json({ status: 'success', data: unit.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to update unit status.' });
  }
}

async function deleteUnit(req, res) {
  try {
    const { unit_id } = req.params;
    const unit = await Unit.findById(unit_id);
    if (!unit) {
      return res.status(404).json({ status: 'error', message: 'Unit not found.' });
    }
    await unit.deleteOne();
    return res.status(200).json({ status: 'success', message: 'Unit deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to delete unit.' });
  }
}

module.exports = {
  createUnit,
  getAllUnits,
  getUnits,
  getUnit,
  updateUnit,
  updateUnitStatus,
  deleteUnit
};
