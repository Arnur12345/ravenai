@echo off
echo Starting AfterTalk Development Environment...
echo.

echo Starting Backend on port 8000...
start "Backend" cmd /k "cd backend && python src/main.py"

timeout /t 5 /nobreak >nul

echo Starting Frontend on port 3000...
start "Frontend" cmd /k "cd aftertalk && npm run dev"

echo.
echo Development servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close all development servers...
pause >nul

echo Closing development servers...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
echo Development servers closed.
pause 