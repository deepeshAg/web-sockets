@echo off
REM Real-time Polling App Startup Script for Windows

echo 🚀 Starting Real-time Polling Application...
echo.

REM Check prerequisites
echo 📋 Checking prerequisites...

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ All prerequisites are installed!
echo.

REM Start backend
echo 🔧 Starting FastAPI backend...
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing backend dependencies...
pip install -r requirements.txt

REM Start backend in background
echo 🚀 Starting FastAPI server on http://localhost:8000
start /b uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo.
echo 🎨 Starting Next.js frontend...
cd ..\frontend

REM Install dependencies
echo 📥 Installing frontend dependencies...
npm install

REM Start frontend
echo 🚀 Starting Next.js server on http://localhost:3000
start /b npm run dev

echo.
echo 🎉 Application started successfully!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo 🔌 WebSocket: ws://localhost:8000/ws
echo.
echo Press any key to stop both servers

pause >nul

echo.
echo 🛑 Stopping servers...
taskkill /f /im python.exe >nul 2>nul
taskkill /f /im node.exe >nul 2>nul
echo ✅ Servers stopped. Goodbye!
pause
