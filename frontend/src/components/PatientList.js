import React from 'react';
import { Table } from 'react-bootstrap';

function PatientList({ patients, onEdit, onDelete, searchTerm }) {
  if (!patients || patients.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h5>No Patients Found</h5>
        <p>{searchTerm ? 'No patients match your search.' : 'Click "Add New Patient" to get started.'}</p>
      </div>
    );
  }

  const getRemarksBadge = (remarks) => {
    if (!remarks) return { text: 'Pending', cls: 'warning' };
    const lower = remarks.toLowerCase();
    if (lower.includes('normal') && !lower.includes('borderline') && !lower.includes('high') && !lower.includes('low') && !lower.includes('critical') && !lower.includes('elevated')) {
      return { text: '✅ Good', cls: 'good' };
    }
    if (lower.includes('critical') || lower.includes('high risk') || (lower.includes('high') && lower.includes('diabetes')) || (lower.includes('high') && lower.includes('cholesterol'))) {
      return { text: '⚠️ Needs Attention', cls: 'danger' };
    }
    return { text: '🟡 Monitor', cls: 'warning' };
  };

  const getBloodStatus = (value, type) => {
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
    return cls;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="table-responsive">
      <Table className="patient-table" hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Patient</th>
            <th>DOB</th>
            <th>Glucose</th>
            <th>Haemoglobin</th>
            <th>Cholesterol</th>
            <th>AI Remarks</th>
            <th style={{ width: '90px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, index) => (
            <tr key={patient.id}>
              <td className="text-muted" style={{ width: '40px' }}>{index + 1}</td>
              <td>
                <div className="patient-name">{patient.full_name}</div>
                <small className="patient-email">{patient.email}</small>
              </td>
              <td style={{ whiteSpace: 'nowrap' }}>{formatDate(patient.date_of_birth)}</td>
              <td>
                <span className="blood-value">
                  <span className={`blood-dot ${getBloodStatus(patient.glucose, 'glucose')}`}></span>
                  {patient.glucose}
                </span>
              </td>
              <td>
                <span className="blood-value">
                  <span className={`blood-dot ${getBloodStatus(patient.haemoglobin, 'haemoglobin')}`}></span>
                  {patient.haemoglobin}
                </span>
              </td>
              <td>
                <span className="blood-value">
                  <span className={`blood-dot ${getBloodStatus(patient.cholesterol, 'cholesterol')}`}></span>
                  {patient.cholesterol}
                </span>
              </td>
              <td>
                <div className="remarks-cell">
                  {patient.remarks ? (
                    <>
                      <span className={`remarks-badge ${getRemarksBadge(patient.remarks).cls}`}>
                        {getRemarksBadge(patient.remarks).text}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                        {patient.remarks.split('|')[0].trim().substring(0, 100)}
                        {patient.remarks.length > 100 ? '...' : ''}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted">No analysis</span>
                  )}
                </div>
              </td>
              <td>
                <button
                  className="action-btn edit"
                  onClick={() => onEdit(patient)}
                  title="Edit patient"
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => onDelete(patient)}
                  title="Delete patient"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default PatientList;