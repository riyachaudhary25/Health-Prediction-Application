from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date
from models import db, Patient
from ai_service import analyze_health
import re

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///health.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

with app.app_context():
    db.create_all()


# Helper: Validate email format
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


# Helper: Validate date format and ensure not future
def is_valid_date(date_str):
    try:
        dob = datetime.strptime(date_str, '%Y-%m-%d').date()
        if dob > date.today():
            return False
        return True
    except (ValueError, TypeError):
        return False


# Helper: Validate numeric value is positive
def is_valid_positive_float(value):
    try:
        val = float(value)
        return val > 0
    except (ValueError, TypeError):
        return False


# Validation function for patient data
def validate_patient_data(data, is_update=False):
    errors = []

    # Full Name
    full_name = data.get('full_name', '').strip()
    if not full_name:
        errors.append("Full name is required.")
    elif not all(c.isalpha() or c.isspace() or c in ".-'`" for c in full_name):
        errors.append("Full name should contain only letters and spaces.")

    # Date of Birth
    dob = data.get('date_of_birth', '')
    if not dob:
        errors.append("Date of birth is required.")
    elif not is_valid_date(dob):
        errors.append("Invalid date or date of birth cannot be in the future. Use YYYY-MM-DD format.")

    # Email
    email = data.get('email', '').strip()
    if not email:
        errors.append("Email address is required.")
    elif not is_valid_email(email):
        errors.append("Invalid email address format.")

    # Glucose
    glucose = data.get('glucose', '')
    if glucose == '' or glucose is None:
        errors.append("Glucose level is required.")
    elif not is_valid_positive_float(glucose):
        errors.append("Glucose must be a positive numeric value.")

    # Haemoglobin
    haemoglobin = data.get('haemoglobin', '')
    if haemoglobin == '' or haemoglobin is None:
        errors.append("Haemoglobin level is required.")
    elif not is_valid_positive_float(haemoglobin):
        errors.append("Haemoglobin must be a positive numeric value.")

    # Cholesterol
    cholesterol = data.get('cholesterol', '')
    if cholesterol == '' or cholesterol is None:
        errors.append("Cholesterol level is required.")
    elif not is_valid_positive_float(cholesterol):
        errors.append("Cholesterol must be a positive numeric value.")

    return errors


# ----- CRUD API ROUTES -----

@app.route('/api/patients', methods=['GET'])
def get_patients():
    """Get all patients"""
    patients = Patient.query.order_by(Patient.created_at.desc()).all()
    return jsonify([p.to_dict() for p in patients]), 200


@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get single patient by ID"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    return jsonify(patient.to_dict()), 200


@app.route('/api/patients', methods=['POST'])
def create_patient():
    """Create a new patient with AI prediction"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validate input
    errors = validate_patient_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    try:
        # Parse date
        dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()

        # Get blood values
        glucose = float(data['glucose'])
        haemoglobin = float(data['haemoglobin'])
        cholesterol = float(data['cholesterol'])

        # Call AI service to generate prediction
        remarks = analyze_health(glucose, haemoglobin, cholesterol)

        # Create patient record
        patient = Patient(
            full_name=data['full_name'].strip(),
            date_of_birth=dob,
            email=data['email'].strip(),
            glucose=glucose,
            haemoglobin=haemoglobin,
            cholesterol=cholesterol,
            remarks=remarks
        )

        db.session.add(patient)
        db.session.commit()

        return jsonify(patient.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Update a patient and regenerate AI prediction"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validate input
    errors = validate_patient_data(data)
    if errors:
        return jsonify({'errors': errors}), 400

    try:
        # Update fields
        patient.full_name = data['full_name'].strip()
        patient.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        patient.email = data['email'].strip()
        patient.glucose = float(data['glucose'])
        patient.haemoglobin = float(data['haemoglobin'])
        patient.cholesterol = float(data['cholesterol'])

        # Re-generate AI prediction
        patient.remarks = analyze_health(
            patient.glucose,
            patient.haemoglobin,
            patient.cholesterol
        )

        db.session.commit()

        return jsonify(patient.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    """Delete a patient"""
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    try:
        db.session.delete(patient)
        db.session.commit()
        return jsonify({'message': 'Patient deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)