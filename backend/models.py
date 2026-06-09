from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    email = db.Column(db.String(120), nullable=False)
    glucose = db.Column(db.Float, nullable=False)
    haemoglobin = db.Column(db.Float, nullable=False)
    cholesterol = db.Column(db.Float, nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat(),
            'email': self.email,
            'glucose': self.glucose,
            'haemoglobin': self.haemoglobin,
            'cholesterol': self.cholesterol,
            'remarks': self.remarks,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }