# QuickShift

AI-powered hotel workforce management for peak-season staffing.

## Repository layout

The React application and Python API are intentionally kept in separate
directories so the backend can be added and developed independently:

```text
QuickShift/
├── frontend/                 # React + Vite application
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── public/
│   ├── src/
│   ├── vite.config.js
│   └── other frontend config files
├── backend/                  # Python API and forecasting services
│   └── requirements.txt
├── .gitignore
└── README.md
```

## Core features

- Workforce demand forecasting
- Staffing shortage detection
- Shift and roster optimisation
- Temporary worker matching
- Workforce analytics dashboard

## Technology stack

- Frontend: React + Vite
- Backend: Python + FastAPI
- Forecasting: Python, pandas, scikit-learn
- Scheduling: Google OR-Tools (planned)
- Version control: Git + GitHub

## Local development

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Backend

Create or activate the virtual environment in `backend/.venv`, then install
the pinned dependencies:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

The backend API will be added independently of the frontend.

## Project status

Hackathon MVP in development.