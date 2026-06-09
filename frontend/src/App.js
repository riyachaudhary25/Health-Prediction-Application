import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar, Container, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import PatientList from './components/PatientList';
import PatientForm from './components/PatientForm';
import { getPatients, deletePatient } from './services/api';

function App() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch patients
  const fetchPatients = useCallback(async () => {
    try {
      const response = await getPatients();
      setPatients(response.data);
    } catch (error) {
      toast.error('❌ Failed to fetch patients. Is the backend running?');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filter patients by search term
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) return patients;
    const term = searchTerm.toLowerCase().trim();
    return patients.filter(p =>
      p.full_name.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  // Handlers
  const handleAdd = () => {
    setEditingPatient(null);
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleDelete = (patient) => {
    setDeleteConfirm(patient);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deletePatient(deleteConfirm.id);
      toast.success(`✅ ${deleteConfirm.full_name} deleted successfully`);
      fetchPatients();
    } catch (error) {
      toast.error('❌ Failed to delete patient');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleModalSuccess = () => {
    fetchPatients();
  };

  // Stats
  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter(p =>
      (p.glucose > 125) || (p.cholesterol > 239) || (p.haemoglobin < 12)
    ).length;
    const normal = patients.filter(p =>
      (p.glucose >= 70 && p.glucose <= 99) &&
      (p.cholesterol < 200) &&
      (p.haemoglobin >= 13.6 && p.haemoglobin <= 17.5)
    ).length;
    return { total, critical, normal };
  }, [patients]);

  return (
    <div className="App">
      {/* Navbar */}
      <Navbar className="navbar-custom" variant="dark" sticky="top">
        <Container>
          <Navbar.Brand className="navbar-brand-custom">
            <span className="brand-icon">🏥</span>
            HealthPrediction AI
            <span className="navbar-subtitle">AI-Powered Blood Test Analysis</span>
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* Main Content */}
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1>📊 Patient Dashboard</h1>
            <p>Manage patient records and run AI-powered health predictions</p>
          </div>
          <button className="btn-primary-custom" onClick={handleAdd}>
            ➕ Add New Patient
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Patients</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-number">{stats.normal}</div>
            <div className="stat-label">Healthy (All Normal)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-number">{stats.critical}</div>
            <div className="stat-label">Needs Attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-number">{patients.filter(p => p.remarks).length}</div>
            <div className="stat-label">AI Analyses Done</div>
          </div>
        </div>

        {/* Table Card */}
        <Card className="table-card">
          <Card.Header className="card-header">
            <h5>📋 Patient Records</h5>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <PatientList
                patients={filteredPatients}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchTerm={searchTerm}
              />
            )}
          </Card.Body>
        </Card>

        {/* Footer */}
        <div className="footer-text">
          HealthPrediction AI — Powered by Clinical Rule Engine &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <PatientForm
        show={showModal}
        onHide={() => setShowModal(false)}
        patient={editingPatient}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-custom">
              <div className="modal-header-custom">
                <h5 className="modal-title">🗑️ Confirm Delete</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteConfirm(null)}></button>
              </div>
              <div className="modal-body-custom text-center py-4">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h5 className="fw-bold">Delete Patient Record</h5>
                <p className="text-muted mb-0">
                  Are you sure you want to delete <strong>{deleteConfirm.full_name}</strong>?
                </p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-top px-4 py-3">
                <button className="btn-outline-custom" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger px-4 fw-semibold" onClick={confirmDelete}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;