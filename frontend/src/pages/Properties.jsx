import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import unitService from '../services/unitService';
import projectService from '../services/projectService';
import buildingService from '../services/buildingService';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import { formatCurrency, getStatusBadgeClass } from '../utils/formatters';
import { confirm, toast, error as showError } from '../utils/alerts';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import JqueryDataTable from '../components/common/JqueryDataTable';
import RecordActionModal from '../components/common/RecordActionModal';
import UnitCardGrid from '../components/properties/UnitCardGrid';
import UnitModal from '../components/properties/UnitModal';
import ProjectModal from '../components/properties/ProjectModal';
import BuildingModal from '../components/properties/BuildingModal';

export default function Properties() {
  const { hasRole } = useAuth();
  const { t } = useCms();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('units'); // 'units' | 'projects' | 'buildings'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Data states
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters for units
  const [unitFilterProject, setUnitFilterProject] = useState('');
  const [unitFilterStatus, setUnitFilterStatus] = useState('All');
  const [unitFilterType, setUnitFilterType] = useState('All');

  // Modals state
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [unitForm, setUnitForm] = useState({
    project: '',
    building: '',
    unitNumber: '',
    floor: 1,
    unitType: '2BHK',
    status: 'Available',
    carpetAreaSqFt: '',
    price: '',
  });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    city: '',
    state: '',
    builder: '',
    status: 'Under Construction',
    address: '',
    description: '',
  });

  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [buildingForm, setBuildingForm] = useState({
    project: '',
    name: '',
    totalFloors: 10,
    notes: '',
  });

  // Mobile Record Action Sheet
  const [recordActionData, setRecordActionData] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [uRes, pRes, bRes] = await Promise.all([
        unitService.getUnits(),
        projectService.getProjects(),
        buildingService.getBuildings(),
      ]);

      if (uRes.status === 'success') setUnits(uRes.data);
      if (pRes.status === 'success') setProjects(pRes.data);
      if (bRes.status === 'success') setBuildings(bRes.data);
      if (isRefresh) toast('Inventory data refreshed', 'success');
    } catch {
      showError('Could not load properties & inventory data.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle URL action
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAddUnit();
    }
  }, [searchParams]);

  // UNIT HANDLERS
  const handleOpenAddUnit = () => {
    setEditingUnitId(null);
    setUnitForm({
      project: projects.length > 0 ? (projects[0].id || projects[0]._id) : '',
      building: '',
      unitNumber: '',
      floor: 1,
      unitType: '2BHK',
      status: 'Available',
      carpetAreaSqFt: '',
      price: '',
    });
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit) => {
    setEditingUnitId(unit.id || unit._id);
    setUnitForm({
      project: unit.project?.id || unit.project?._id || unit.project || '',
      building: unit.building?.id || unit.building?._id || unit.building || '',
      unitNumber: unit.unitNumber || '',
      floor: unit.floor ?? 1,
      unitType: unit.unitType || '2BHK',
      status: unit.status || 'Available',
      carpetAreaSqFt: unit.carpetAreaSqFt ?? '',
      price: unit.price ?? '',
    });
    setIsUnitModalOpen(true);
  };

  const handleSubmitUnit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUnitId) {
        await unitService.updateUnit(editingUnitId, unitForm);
        toast('Property unit updated successfully!', 'success');
      } else {
        await unitService.createUnit(unitForm);
        toast('Property unit created successfully!', 'success');
      }
      setIsUnitModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to save unit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unit) => {
    const ok = await confirm(
      'Delete Unit?',
      `Are you sure you want to permanently delete unit "${unit.unitNumber}"?`,
      'Yes, Delete'
    );
    if (!ok) return;

    try {
      await unitService.deleteUnit(unit.id || unit._id);
      toast('Unit deleted successfully', 'info');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete unit');
    }
  };

  const handleBookUnit = (unit) => {
    navigate(`/bookings?action=new&unitId=${unit.id || unit._id}`);
  };

  // PROJECT HANDLERS
  const handleOpenAddProject = () => {
    setEditingProjectId(null);
    setProjectForm({
      name: '',
      city: '',
      state: '',
      builder: '',
      status: 'Under Construction',
      address: '',
      description: '',
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj) => {
    setEditingProjectId(proj.id || proj._id);
    setProjectForm({
      name: proj.name || '',
      city: proj.city || '',
      state: proj.state || '',
      builder: proj.builder || '',
      status: proj.status || 'Under Construction',
      address: proj.address || '',
      description: proj.description || '',
    });
    setIsProjectModalOpen(true);
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProjectId) {
        await projectService.updateProject(editingProjectId, projectForm);
        toast('Project updated successfully!', 'success');
      } else {
        await projectService.createProject(projectForm);
        toast('Project created successfully!', 'success');
      }
      setIsProjectModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (proj) => {
    const ok = await confirm(
      'Delete Project?',
      `Are you sure you want to delete master project "${proj.name}"? This action cannot be undone.`,
      'Yes, Delete'
    );
    if (!ok) return;

    try {
      await projectService.deleteProject(proj.id || proj._id);
      toast('Project deleted successfully', 'info');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete project');
    }
  };

  // BUILDING HANDLERS
  const handleOpenAddBuilding = () => {
    setEditingBuildingId(null);
    setBuildingForm({
      project: projects.length > 0 ? (projects[0].id || projects[0]._id) : '',
      name: '',
      totalFloors: 10,
      notes: '',
    });
    setIsBuildingModalOpen(true);
  };

  const handleOpenEditBuilding = (bld) => {
    setEditingBuildingId(bld.id || bld._id);
    setBuildingForm({
      project: bld.project?.id || bld.project?._id || bld.project || '',
      name: bld.name || '',
      totalFloors: bld.totalFloors ?? 10,
      notes: bld.notes || '',
    });
    setIsBuildingModalOpen(true);
  };

  const handleSubmitBuilding = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBuildingId) {
        await buildingService.updateBuilding(editingBuildingId, buildingForm);
        toast('Building updated successfully!', 'success');
      } else {
        await buildingService.createBuilding(buildingForm);
        toast('Building created successfully!', 'success');
      }
      setIsBuildingModalOpen(false);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to save building');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBuilding = async (bld) => {
    const ok = await confirm(
      'Delete Building?',
      `Are you sure you want to delete tower/building "${bld.name}"?`,
      'Yes, Delete'
    );
    if (!ok) return;

    try {
      await buildingService.deleteBuilding(bld.id || bld._id);
      toast('Building deleted successfully', 'info');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete building');
    }
  };

  // Filtered Units
  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const pId = u.project?.id || u.project?._id || u.project;
      const matchProject = !unitFilterProject || pId === unitFilterProject;
      const matchStatus = unitFilterStatus === 'All' || u.status === unitFilterStatus;
      const matchType = unitFilterType === 'All' || u.unitType === unitFilterType;
      return matchProject && matchStatus && matchType;
    });
  }, [units, unitFilterProject, unitFilterStatus, unitFilterType]);

  // Units DataTables Columns
  const unitColumns = useMemo(
    () => [
      {
        title: 'Unit Number',
        data: 'unitNumber',
        render: (data, type, row) => `
          <div class="fw-bold text-body">${data || '-'}</div>
          <small class="text-muted">Floor ${row.floor ?? '-'}</small>
        `,
      },
      {
        title: 'Project & Tower',
        data: 'project',
        render: (data, type, row) => `
          <div class="fw-medium text-body">${data?.name || '-'}</div>
          <small class="text-muted">${row.building?.name || '-'}</small>
        `,
      },
      {
        title: 'Type',
        data: 'unitType',
        render: (data) => `<span class="badge bg-body-secondary text-body">${data || '2BHK'}</span>`,
      },
      {
        title: 'Carpet Area',
        data: 'carpetAreaSqFt',
        render: (data) => (data ? `${data} sq.ft` : '-'),
      },
      {
        title: 'Price',
        data: 'price',
        render: (data) => `<span class="fw-bold text-primary">${formatCurrency(data || 0)}</span>`,
      },
      {
        title: 'Status',
        data: 'status',
        render: (data) => `<span class="badge ${getStatusBadgeClass(data)}">${data}</span>`,
      },
      {
        title: 'Actions',
        data: null,
        orderable: false,
        className: 'text-end',
        render: (data, type, row) => `
          <div class="btn-group btn-group-sm">
            ${
              row.status === 'Available'
                ? `<button type="button" class="btn btn-outline-primary btn-sm" data-action="book" title="Book Unit"><i class="fas fa-file-signature"></i></button>`
                : ''
            }
            <button type="button" class="btn btn-outline-secondary btn-sm" data-action="edit" title="Edit Unit"><i class="fas fa-pen-to-square"></i></button>
            <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" title="Delete Unit"><i class="fas fa-trash-can"></i></button>
          </div>
        `,
      },
    ],
    []
  );

  const handleUnitTableAction = (action, unit) => {
    if (action === 'book') handleBookUnit(unit);
    else if (action === 'edit') handleOpenEditUnit(unit);
    else if (action === 'delete') handleDeleteUnit(unit);
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading properties and inventory..." />;
  }

  return (
    <div className="crm-properties-page">
      <PageHeader
        title={t('properties_title', 'Property & Inventory Management')}
        subtitle={t('properties_subtitle', 'Explore real estate projects, buildings, and unit availability in real time')}
        primaryActionLabel={
          activeTab === 'units' ? 'Add Unit' : activeTab === 'projects' ? 'Add Project' : 'Add Building'
        }
        primaryActionIcon="fa-plus"
        onPrimaryAction={() => {
          if (activeTab === 'units') handleOpenAddUnit();
          else if (activeTab === 'projects') handleOpenAddProject();
          else handleOpenAddBuilding();
        }}
        onRefresh={() => fetchData(true)}
        refreshing={refreshing}
      />

      {/* Responsive Segmented Tab Pill Navigation Bar */}
      <div className="d-flex align-items-center gap-2 mb-3 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          type="button"
          className={`btn btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill text-nowrap ${
            activeTab === 'units' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
          }`}
          onClick={() => setActiveTab('units')}
        >
          <i className="fas fa-door-open"></i>
          <span>Units</span>
          <span className={`badge rounded-pill ms-1 ${activeTab === 'units' ? 'bg-white text-primary' : 'bg-body-secondary text-body'}`}>
            {units.length}
          </span>
        </button>

        <button
          type="button"
          className={`btn btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill text-nowrap ${
            activeTab === 'projects' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
          }`}
          onClick={() => setActiveTab('projects')}
        >
          <i className="fas fa-city"></i>
          <span>Master Projects</span>
          <span className={`badge rounded-pill ms-1 ${activeTab === 'projects' ? 'bg-white text-primary' : 'bg-body-secondary text-body'}`}>
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          className={`btn btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill text-nowrap ${
            activeTab === 'buildings' ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
          }`}
          onClick={() => setActiveTab('buildings')}
        >
          <i className="fas fa-building"></i>
          <span>Buildings & Towers</span>
          <span className={`badge rounded-pill ms-1 ${activeTab === 'buildings' ? 'bg-white text-primary' : 'bg-body-secondary text-body'}`}>
            {buildings.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: UNITS                                            */}
      {/* ======================================================== */}
      {activeTab === 'units' && (
        <>
          {/* Units Filter & View Bar (Protected from Mobile Collapse) */}
          <div className="card crm-card border-0 shadow-sm p-2.5 p-sm-3 mb-3">
            <div className="row g-2 align-items-center">
              <div className="col-12 col-sm-6 col-md-4">
                <select
                  className="form-select form-select-sm text-truncate"
                  value={unitFilterProject}
                  onChange={(e) => setUnitFilterProject(e.target.value)}
                  aria-label="Filter by Master Project"
                >
                  <option value="">All Master Projects</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6 col-sm-3 col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={unitFilterStatus}
                  onChange={(e) => setUnitFilterStatus(e.target.value)}
                  aria-label="Filter by Status"
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Booked">Booked</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div className="col-6 col-sm-3 col-md-2">
                <select
                  className="form-select form-select-sm"
                  value={unitFilterType}
                  onChange={(e) => setUnitFilterType(e.target.value)}
                  aria-label="Filter by Unit Type"
                >
                  <option value="All">All Types</option>
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                  <option value="4BHK">4BHK</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Villa">Villa</option>
                </select>
              </div>

              <div className="col-12 col-md-auto ms-auto d-flex align-items-center justify-content-between justify-content-md-end gap-2 pt-1 pt-md-0 border-top border-top-md-0">
                <span className="text-muted small text-nowrap" style={{ fontSize: '0.78rem' }}>
                  {filteredUnits.length} of {units.length} units
                </span>
                <div className="btn-group btn-group-sm">
                  <button
                    type="button"
                    className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <i className="fas fa-grid-2"></i>
                  </button>
                  <button
                    type="button"
                    className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setViewMode('table')}
                    title="Table View"
                  >
                    <i className="fas fa-table-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Grid or Table View */}
          {viewMode === 'grid' ? (
            <UnitCardGrid
              units={filteredUnits}
              onOpenUnitModal={handleOpenAddUnit}
              onEditUnit={handleOpenEditUnit}
              onDeleteUnit={handleDeleteUnit}
              onBookUnit={handleBookUnit}
            />
          ) : (
            <div className="card crm-card border-0 shadow-sm">
              <div className="card-body p-3">
                <JqueryDataTable
                  columns={unitColumns}
                  data={filteredUnits}
                  onAction={handleUnitTableAction}
                  tableId="unitsDataTable"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PROJECTS                                         */}
      {/* ======================================================== */}
      {activeTab === 'projects' && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          {projects.map((proj) => {
            const projId = proj.id || proj._id;
            const projectUnits = units.filter(
              (u) => (u.project?._id || u.project?.id || u.project) === projId
            );
            const availableCount = projectUnits.filter((u) => u.status === 'Available').length;
            const projectBuildings = buildings.filter(
              (b) => (b.project?._id || b.project?.id || b.project) === projId
            );

            return (
              <div key={projId} className="col">
                <div className="card crm-card border-0 shadow-sm h-100 overflow-hidden">
                  <div className="card-body p-3.5 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold px-2 py-1">
                          {proj.status || 'Active'}
                        </span>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <i className="fas fa-location-dot text-danger"></i>
                          <span>{proj.city || 'City'}, {proj.state || 'State'}</span>
                        </small>
                      </div>

                      <h5 className="fw-bold mb-1 text-body">{proj.name}</h5>
                      {proj.builder && (
                        <p className="text-muted small mb-2">
                          Developer: <span className="fw-medium text-body">{proj.builder}</span>
                        </p>
                      )}

                      {/* Project Inventory Summary Capsule */}
                      <div className="d-flex align-items-center gap-2 p-2 rounded-2 bg-body-tertiary mb-3 small">
                        <div className="flex-fill text-center border-end">
                          <span className="d-block fw-bold text-primary">{projectUnits.length}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Total Units</span>
                        </div>
                        <div className="flex-fill text-center border-end">
                          <span className="d-block fw-bold text-success">{availableCount}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Available</span>
                        </div>
                        <div className="flex-fill text-center">
                          <span className="d-block fw-bold text-purple" style={{ color: '#8b5cf6' }}>{projectBuildings.length}</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Towers</span>
                        </div>
                      </div>

                      {proj.description && (
                        <p className="text-muted small mb-3 text-truncate-2" style={{ fontSize: '0.8rem' }}>
                          {proj.description}
                        </p>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-1.5 pt-3 border-top mt-auto">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                        onClick={() => handleOpenEditProject(proj)}
                      >
                        <i className="fas fa-pen-to-square me-1"></i> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteProject(proj)}
                        title="Delete Project"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BUILDINGS                                        */}
      {/* ======================================================== */}
      {activeTab === 'buildings' && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          {buildings.map((bld) => {
            const bldId = bld.id || bld._id;
            const bldUnits = units.filter(
              (u) => (u.building?._id || u.building?.id || u.building) === bldId
            );

            return (
              <div key={bldId} className="col">
                <div className="card crm-card border-0 shadow-sm h-100 overflow-hidden">
                  <div className="card-body p-3.5 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="badge bg-info-subtle text-info border border-info-subtle fw-semibold px-2 py-1">
                          {bld.totalFloors ?? 10} Floors
                        </span>
                        <small className="text-muted">
                          {bld.project?.name || 'Master Project'}
                        </small>
                      </div>

                      <h5 className="fw-bold mb-2 text-body d-flex align-items-center">
                        <i className="fas fa-building text-primary me-2"></i>
                        <span>{bld.name}</span>
                      </h5>

                      <div className="p-2 rounded-2 bg-body-tertiary mb-3 small d-flex justify-content-between align-items-center">
                        <span className="text-muted">Registered Units:</span>
                        <span className="fw-bold text-primary">{bldUnits.length} Units</span>
                      </div>

                      {bld.notes && (
                        <p className="text-muted small mb-3" style={{ fontSize: '0.8rem' }}>
                          {bld.notes}
                        </p>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-1.5 pt-3 border-top mt-auto">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                        onClick={() => handleOpenEditBuilding(bld)}
                      >
                        <i className="fas fa-pen-to-square me-1"></i> Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteBuilding(bld)}
                        title="Delete Building"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Unit Modal */}
      <UnitModal
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        isEditing={Boolean(editingUnitId)}
        formData={unitForm}
        onChange={(e) => setUnitForm({ ...unitForm, [e.target.name]: e.target.value })}
        onSubmit={handleSubmitUnit}
        projects={projects}
        buildings={buildings}
        submitting={submitting}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        isEditing={Boolean(editingProjectId)}
        formData={projectForm}
        onChange={(e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value })}
        onSubmit={handleSubmitProject}
        submitting={submitting}
      />

      {/* Building Modal */}
      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        isEditing={Boolean(editingBuildingId)}
        formData={buildingForm}
        onChange={(e) => setBuildingForm({ ...buildingForm, [e.target.name]: e.target.value })}
        onSubmit={handleSubmitBuilding}
        projects={projects}
        submitting={submitting}
      />

      {/* Mobile Record Action Sheet */}
      <RecordActionModal
        isOpen={Boolean(recordActionData)}
        onClose={() => setRecordActionData(null)}
        record={recordActionData}
        recordType="unit"
        onEdit={(unit) => handleOpenEditUnit(unit)}
        onDelete={(unit) => handleDeleteUnit(unit)}
        onBookUnit={(unit) => handleBookUnit(unit)}
      />
    </div>
  );
}
