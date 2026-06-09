import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Row, Col, Spinner, Alert
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { createPatient, updatePatient } from '../services/api';

const initialFormState = {
  full_name: '',
  date_of_birth: '',
  email: '',
  glucose: '',
  haemoglobin: '',
  cholesterol: ''
};

const initialErrors = {};

function PatientForm({ show, onHide, patient, onSuccess }) {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const isEditing = Boolean(patient);

  useEffect(() => {
    if (patient) {
      setForm({
        full_name: patient.full_name || '',
        date_of_birth: patient.date_of_birth || '',
        email: patient.email || '',
        glucose: patient.glucose || '',
        haemoglobin: patient.haemoglobin || '',
        cholesterol: patient.cholesterol || ''
      });
      setAiResult(patient.remarks || '');
    } else {
      setForm(initialFormState);
      setAiResult('');
    }
    setErrors({});
    setAiLoading(false);
  }, [patient, show]);

  const validate = () => {
    const newErrors = {};

    // Full Name
    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (!/^[a-zA-Z\s.\-']+$/.test(form.full_name.trim())) {
      newErrors.full_name = 'Name should contain only letters and spaces';
    }

    // Date of Birth
    if (!form.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(form.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(dob.getTime())) {
        newErrors.date_of_birth = 'Invalid date format';
      } else if (dob > today) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future';
      }
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      newErrors.email = 'Invalid email address format';
    }

    // Glucose
    if (!form.glucose && form.glucose !== 0) {
      newErrors.glucose = 'Glucose level is required';
    } else if (isNaN(form.glucose) || Number(form.glucose) <= 0) {
      newErrors.glucose = 'Must be a positive number';
    }

    // Haemoglobin
    if (!form.haemoglobin && form.haemoglobin !== 0) {
      newErrors.haemoglobin = 'Haemoglobin level is required';
    } else if (isNaN(form.haemoglobin) || Number(form.haemoglobin) <= 0) {
      newErrors.haemoglobin = 'Must be a positive number';
    }

    // Cholesterol
    if (!form.cholesterol && form.cholesterol !== 0) {
      newErrors.cholesterol = 'Cholesterol level is required';
    } else if (isNaN(form.cholesterol) || Number(form.cholesterol) <= 0) {
      newErrors.cholesterol = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Simulate AI analysis locally (mirrors backend)
  const simulateAiAnalysis = (glucose, haemoglobin, cholesterol) => {
    const g = Number(glucose);
    const h = Number(haemoglobin);
    const c = Number(cholesterol);

    if (isNaN(g) || isNaN(h) || isNaN(c) || g <= 0 || h <= 0 || c <= 0) {
      return '';
    }

    return `🩺 AI Health Analysis Complete\n\nGlucose (${g} mg/dL): ${g > 125 ? '🔴 High - Diabetes risk' : g >= 100 ? '🟡 Borderline - Prediabetes' : '✅ Normal'}\nHaemoglobin (${h} g/dL): ${h < 12 ? '🔴 Low - Possible anemia' : h > 17.5 ? '🟡 Elevated' : '✅ Normal'}\nCholesterol (${c} mg/dL): ${c > 239 ? '🔴 High - Heart disease risk' : c >= 200 ? '🟡 Borderline' : '✅ Normal'}`;
  };

  const handleAnalyze = () => {
    const { glucose, haemoglobin, cholesterol } = form;
    if (!glucose || !haemoglobin || !cholesterol) {
      toast.warning('Please fill in all blood test values first');
      return;
    }
    if (isNaN(glucose) || isNaN(haemoglobin) || isNaN(cholesterol)) {
      toast.warning('Blood test values must be numeric');
      return;
    }
    setAiLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const result = simulateAiAnalysis(glucose, haemoglobin, cholesterol);
      setAiResult(result);
      setAiLoading(false);
      toast.success('✅ AI Analysis Complete!');
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = {
        full_name: form.full_name.trim(),
        date_of_birth: form.date_of_birth,
        email: form.email.trim(),
        glucose: Number(form.glucose),
        haemoglobin: Number(form.haemoglobin),
        cholesterol: Number(form.cholesterol)
      };

      if (isEditing) {
        await updatePatient(patient.id, data);
        toast.success('✅ Patient updated successfully!');
      } else {
        await createPatient(data);
        toast.success('✅ Patient added successfully!');
      }

      onSuccess();
      onHide();
    } catch (error) {
      const errMsg = error.response?.data?.errors?.join(', ') || error.response?.data?.error || 'Failed to save patient';
      toast.error(`❌ ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDot = (value, type) => {
    if (!value || isNaN(value)) return null;
    const v = Number(value);
    let cls = 'normal';
    if (type === 'glucose') {
      if (v > 125) cls = 'critical';
      else if (v >= 100) cls = 'borderline';
    } else if (type === 'haemoglobin') {
      if (v < 12 || v > 17.5) cls = 'critical';
      else if (v < 13.6) cls = 'borderline';
    } else if (type === 'cholesterol') {
      if (v > 239) cls = 'critical';
      else if (v >= 200) cls = 'borderline';
    }
    return <span className={`blood-dot ${cls}`} title={`Status: ${cls}`}></span>;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <div className="modal-content-custom">
        <div className="modal-header-custom">
          <h5 className="modal-title">
            {isEditing ? '✏️ Edit Patient' : '➕ Add New Patient'}
          </h5>
          <button type="button" className="btn-close" onClick={onHide} aria-label="Close"></button>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="modal-body-custom">
            {/* Personal Information */}
            <div className="form-section">
              <div className="form-section-title">📋 Personal Information</div>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      className={`form-control-custom ${errors.full_name ? 'is-invalid' : ''}`}
                      placeholder="Enter full name"
                    />
                    {errors.full_name && (
                      <div className="invalid-feedback-custom">⚠️ {errors.full_name}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_of_birth"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      className={`form-control-custom ${errors.date_of_birth ? 'is-invalid' : ''}`}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {errors.date_of_birth && (
                      <div className="invalid-feedback-custom">⚠️ {errors.date_of_birth}</div>
                    )}
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <div className="invalid-feedback-custom">⚠️ {errors.email}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Blood Test Values */}
            <div className="form-section">
              <div className="form-section-title">🩸 Blood Test Values</div>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Glucose {getStatusDot(form.glucose, 'glucose')}
                      <small className="text-muted ms-2">(mg/dL)</small>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="glucose"
                      value={form.glucose}
                      onChange={handleChange}
                      className={`form-control-custom ${errors.glucose ? 'is-invalid' : ''}`}
                      placeholder="e.g. 95"
                    />
                    {errors.glucose && (
                      <div className="invalid-feedback-custom">⚠️ {errors.glucose}</div>
                    )}
                    <Form.Text className="text-muted">Normal: 70–99 mg/dL</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Haemoglobin {getStatusDot(form.haemoglobin, 'haemoglobin')}
                      <small className="text-muted ms-2">(g/dL)</small>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="haemoglobin"
                      value={form.haemoglobin}
                      onChange={handleChange}
                      className={`form-control-custom ${errors.haemoglobin ? 'is-invalid' : ''}`}
                      placeholder="e.g. 14.5"
                    />
                    {errors.haemoglobin && (
                      <div className="invalid-feedback-custom">⚠️ {errors.haemoglobin}</div>
                    )}
                    <Form.Text className="text-muted">Normal: 13.6–17.5 g/dL</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      Cholesterol {getStatusDot(form.cholesterol, 'cholesterol')}
                      <small className="text-muted ms-2">(mg/dL)</small>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      name="cholesterol"
                      value={form.cholesterol}
                      onChange={handleChange}
                      className={`form-control-custom ${errors.cholesterol ? 'is-invalid' : ''}`}
                      placeholder="e.g. 180"
                    />
                    {errors.cholesterol && (
                      <div className="invalid-feedback-custom">⚠️ {errors.cholesterol}</div>
                    )}
                    <Form.Text className="text-muted">Normal: 125–199 mg/dL</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Analyze Button */}
              <div className="d-flex justify-content-center mt-2">
                <button
                  type="button"
                  className="btn-primary-custom"
                  onClick={handleAnalyze}
                  disabled={aiLoading}
                >
                  {aiLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Analyzing...
                    </>
                  ) : (
                    '🤖 Run AI Health Analysis'
                  )}
                </button>
              </div>
            </div>

            {/* AI Analysis Result */}
            {aiResult && (
              <div className="ai-analysis-box">
                <div className="ai-label">
                  {aiLoading && <div className="spinner"></div>}
                  🧠 AI Health Prediction Result
                </div>
                <div className="ai-result">{aiResult}</div>
              </div>
            )}

            {!aiResult && !aiLoading && (
              <Alert variant="info" className="mt-3 mb-0 py-2" style={{ fontSize: '0.85rem' }}>
                💡 Click <strong>"Run AI Health Analysis"</strong> after entering blood values to generate an AI prediction.
              </Alert>
            )}
          </div>

          <div className="modal-footer border-top px-4 py-3">
            <button type="button" className="btn-outline-custom" onClick={onHide}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-success-custom"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                isEditing ? '💾 Update Patient' : '💾 Save Patient'
              )}
            </button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}

export default PatientForm;