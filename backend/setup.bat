@echo off
echo ============================================
echo   HealthPrediction AI - Backend Setup
echo ============================================
echo.

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [1/3] Creating Python virtual environment...
    python -m venv venv
) else (
    echo [1/3] Virtual environment already exists.
)

REM Install dependencies
echo [2/3] Installing Python dependencies...
call venv\Scripts\pip install -r requirements.txt

REM Initialize database
echo [3/3] Database will be created automatically on first run.

echo.
echo ============================================
echo   Setup Complete!
echo   Run 'venv\Scripts\python app.py' to start
echo ============================================
pause