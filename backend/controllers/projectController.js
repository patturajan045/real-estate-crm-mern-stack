const Project = require('../models/Project');

async function createProject(req, res) {
  try {
    const data = { ...req.body };
    delete data.projectId;
    delete data.id;
    delete data._id;

    if (!data.name || !data.city) {
      return res.status(400).json({ status: 'error', message: 'Project name and city are required.' });
    }

    const existing = await Project.findOne({ name: data.name.trim() });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'A project with this name already exists.' });
    }

    const project = await Project.create(data);
    return res.status(201).json({ status: 'success', data: project.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to create project.' });
  }
}

async function getProjects(req, res) {
  try {
    const projects = await Project.find().sort({ addedTime: -1 });
    return res.status(200).json({ status: 'success', data: projects.map(p => p.toJSON()) });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to fetch projects.' });
  }
}

async function getProject(req, res) {
  try {
    const { project_id } = req.params;
    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found.' });
    }
    return res.status(200).json({ status: 'success', data: project.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to retrieve project.' });
  }
}

async function updateProject(req, res) {
  try {
    const { project_id } = req.params;
    const data = { ...req.body };
    delete data.projectId;
    delete data.id;
    delete data._id;

    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found.' });
    }

    Object.assign(project, data);
    await project.save();

    return res.status(200).json({ status: 'success', data: project.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to update project.' });
  }
}

async function deleteProject(req, res) {
  try {
    const { project_id } = req.params;
    const project = await Project.findById(project_id);
    if (!project) {
      return res.status(404).json({ status: 'error', message: 'Project not found.' });
    }
    await project.deleteOne();
    return res.status(200).json({ status: 'success', message: 'Project deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Unable to delete project.' });
  }
}

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
};
