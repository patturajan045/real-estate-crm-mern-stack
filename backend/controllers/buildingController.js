const Building = require('../models/Building');
const Project = require('../models/Project');

async function createBuilding(req, res) {
  try {
    const data = { ...req.body };
    delete data.buildingId;
    delete data.id;
    delete data._id;

    if (!data.name) {
      return res.status(400).json({ status: 'error', message: 'Building name is required.' });
    }
    if (!data.project) {
      return res.status(400).json({ status: 'error', message: 'Project is required.' });
    }

    const project = await Project.findById(data.project);
    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Referenced Project not found.' });
    }

    if (data.totalFloors !== undefined) {
      data.totalFloors = parseInt(data.totalFloors, 10) || 1;
    }

    const building = await Building.create(data);
    await building.populate('project', 'name');

    return res.status(201).json({ status: 'success', data: building.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to create building.' });
  }
}

async function getAllBuildings(req, res) {
  try {
    const { project_id } = req.query;
    const filter = project_id ? { project: project_id } : {};
    const sort = project_id ? { name: 1 } : { addedTime: -1 };

    const buildings = await Building.find(filter).populate('project', 'name').sort(sort);
    return res.status(200).json({ status: 'success', data: buildings.map(b => b.toJSON()) });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch buildings.' });
  }
}

async function getBuildings(req, res) {
  try {
    const { project_id } = req.params;
    const buildings = await Building.find({ project: project_id }).populate('project', 'name').sort({ name: 1 });
    return res.status(200).json({ status: 'success', data: buildings.map(b => b.toJSON()) });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch project buildings.' });
  }
}

async function getBuilding(req, res) {
  try {
    const { building_id } = req.params;
    const building = await Building.findById(building_id).populate('project', 'name');
    if (!building) {
      return res.status(404).json({ status: 'error', message: 'Building not found.' });
    }
    return res.status(200).json({ status: 'success', data: building.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve building.' });
  }
}

async function updateBuilding(req, res) {
  try {
    const { building_id } = req.params;
    const data = { ...req.body };
    delete data.buildingId;
    delete data.id;
    delete data._id;

    const building = await Building.findById(building_id);
    if (!building) {
      return res.status(404).json({ status: 'error', message: 'Building not found.' });
    }

    if (data.project) {
      const proj = await Project.findById(data.project);
      if (proj) building.project = proj._id;
      delete data.project;
    }

    if (data.totalFloors !== undefined) {
      building.totalFloors = parseInt(data.totalFloors, 10) || 1;
      delete data.totalFloors;
    }

    Object.assign(building, data);
    await building.save();
    await building.populate('project', 'name');

    return res.status(200).json({ status: 'success', data: building.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to update building.' });
  }
}

async function deleteBuilding(req, res) {
  try {
    const { building_id } = req.params;
    const building = await Building.findById(building_id);
    if (!building) {
      return res.status(404).json({ status: 'error', message: 'Building not found.' });
    }
    await building.deleteOne();
    return res.status(200).json({ status: 'success', message: 'Building deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to delete building.' });
  }
}

module.exports = {
  createBuilding,
  getAllBuildings,
  getBuildings,
  getBuilding,
  updateBuilding,
  deleteBuilding
};
