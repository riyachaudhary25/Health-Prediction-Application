# 🏥 HealthPrediction AI

AI-powered Health Prediction Application that analyzes patient blood test results using a clinical rule engine and provides health risk assessments.

## ✨ Features

- **CRUD Operations** — Create, Read, Update, and Delete patient records
- **AI Health Analysis** — Predicts health conditions based on Glucose, Haemoglobin, and Cholesterol levels
- **Blood Value Visualizations** — Color-coded indicators (🟢 Normal / 🟡 Borderline / 🔴 Critical)
- **Smart Search** — Filter patients by name or email
- **Dashboard Stats** — Quick overview of total patients, healthy vs. critical cases
- **Data Validation** — Client-side + server-side validation for all inputs
- **Persistent Storage** — SQLite database for reliable data storage
- **Modern UI** — Clean, responsive design with React + Bootstrap

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + React Bootstrap + Axios |
| **Backend** | Python Flask + Flask-SQLAlchemy + Flask-CORS |
| **Database** | SQLite |
| **AI Engine** | Clinical Rule-Based Prediction Engine |

## 📁 Project Structure

```
Health-Prediction-Application/
├── backend/
│   ├── app.py              # Flask REST API (CRUD endpoints)
│   ├── models.py           # SQLAlchemy Patient model
│   ├── ai_service.py       # Clinical AI prediction engine
│   ├── requirements.txt    # Python dependencies
│   ├── setup.bat           # Backend setup script
│   └── instance/
│       └── health.db       # SQLite database (auto-created)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main dashboard component
│   │   ├── App.css         # Custom styles
│   │   ├── index.js        # React entry point
│   │   ├── services/
│   │   │   └── api.js      # Axios API client
│   │   └── components/
│   │       ├── PatientForm.js   # Add/Edit patient modal
│   │       └── PatientList.js   # Patient records table
│   ├── .env.example        # Environment variables template
│   └── package.json
├── .gitignore
├── package.json            # Root project scripts
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** — [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** — [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)

### Option 1: One-Click Setup

```bash
# Clone the repository
git clone https://github.com/riyachaudhary25/Health-Prediction-Application.git
cd Health-Prediction-Application

# Backend setup
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt

# Start backend (in one terminal)
venv\Scripts\python app.py

# Frontend setup (in another terminal)
cd frontend
npm install
npm start
```

### Option 2: Using setup.bat (Windows)

1. Double-click `backend/setup.bat` to install backend dependencies
2. Run `venv\Scripts\python app.py` in the `backend/` folder
3. Open a new terminal in `frontend/` and run:
   ```bash
   npm install
   npm start
   ```

### Option 3: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\pip install -r requirements.txt
venv\Scripts\python app.py
```

**Frontend (new terminal):**
```bash
cd frontend
npm install
npm start
```

### 🔗 Access the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | Get all patients |
| `GET` | `/api/patients/<id>` | Get a single patient |
| `POST` | `/api/patients` | Create a new patient (triggers AI analysis) |
| `PUT` | `/api/patients/<id>` | Update a patient (re-triggers AI analysis) |
| `DELETE` | `/api/patients/<id>` | Delete a patient |

### Example API Call

```bash
curl -X POST http://127.0.0.1:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "date_of_birth": "1990-05-15",
    "email": "john@example.com",
    "glucose": 110,
    "haemoglobin": 14.5,
    "cholesterol": 210
  }'
```

## 🧠 AI Prediction Engine

The clinical rule engine analyzes three key blood markers:

| Marker | Normal Range | Borderline | Critical |
|--------|-------------|------------|----------|
| **Glucose** | 70–99 mg/dL | 100–125 mg/dL | >125 or <70 mg/dL |
| **Haemoglobin** | 13.6–17.5 g/dL | 12–13.5 g/dL | <12 or >17.5 g/dL |
| **Cholesterol** | 125–199 mg/dL | 200–239 mg/dL | >239 or <125 mg/dL |

The engine generates an overall health assessment based on the combination of all markers.

## 🔧 Environment Variables

Copy `frontend/.env.example` to `frontend/.env` to configure the API URL:

```
REACT_APP_API_URL=http://127.0.0.1:5000/api
```

## 📦 Dependencies

### Backend (Python)
- Flask 3.1.3
- Flask-CORS 6.0.5
- Flask-SQLAlchemy 3.1.1

### Frontend (Node.js)
- React 18
- React Bootstrap
- Axios
- React Toastify

## 🗑️ What's NOT in Git (gitignored)

- `backend/venv/` — Python virtual environment
- `backend/instance/` — SQLite database file
- `frontend/node_modules/` — npm packages
- `frontend/build/` — Production build
- `.env` — Environment variables
- `.vscode/`, `.idea/` — IDE settings
- `*.log` — Log files

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License — See LICENSE file for details

---

<div align="center">
  Made with ❤️ for Health Prediction
</div>