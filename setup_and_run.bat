@echo off
setlocal

echo.
echo ===========================================
echo   Starting Nexus Enterprise (Production)
echo ===========================================

:: Check for node_modules
if not exist "node_modules\" (
    echo.
    echo [INFO] node_modules not found. Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b %errorlevel%
    )
)

:: Check for .env file
if not exist ".env" (
    echo [WARNING] .env file not found. Creating default...
    (
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rest_express_db
        echo SESSION_SECRET=pro_secret_%RANDOM%%RANDOM%
        echo NODE_ENV=production
        echo PORT=5001
    ) > .env
)

echo.
echo [1/4] Setting up Database...
call npm run db:push
if %errorlevel% neq 0 (
    echo [ERROR] Database setup failed.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Seeding Database...
call npm run seed
if %errorlevel% neq 0 (
    echo [ERROR] Database seeding failed.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Building for Production...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Starting Server...
echo.
echo App running at: http://localhost:5001
echo.

call npm start

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server crashed or stopped unexpectedly.
    pause
)

endlocal
