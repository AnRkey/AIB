@echo off
setlocal enabledelayedexpansion

:: AIB Build Script
echo ========================================
echo            AIB Build Script            
echo ========================================
echo.


:: Create build directory if it doesn't exist
if not exist "build" (
    mkdir build
    echo Created build directory.
)

:: Clear previous build files
echo Cleaning previous build files...
if exist "build\*" (
    del /q "build\*"
)

:: Check for Node.js and npm
echo Checking for Node.js and npm...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo npm is not installed or not in PATH.
    echo Please install npm, which typically comes with Node.js.
    exit /b 1
)

:: Display Node.js and npm versions
echo Node.js version:
node --version
echo npm version:
npm --version
echo.

:: Configure npm for optimal build performance
echo Configuring npm...
call npm config set fund false
call npm config set audit false
call npm config set loglevel error

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install dependencies.
        exit /b 1
    )
)

:: Install electron-builder globally if not already installed
where electron-builder >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Installing electron-builder...
    call npm install -g electron-builder
    if %ERRORLEVEL% neq 0 (
        echo Failed to install electron-builder.
        exit /b 1
    )
)

:: Build the application
echo.
echo Building AIB application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed.
    exit /b 1
)

:: Check if build was successful
echo.
if exist "build\AIB_Installer-v*.exe" (
    echo =============================================
    echo Build completed successfully!
    echo.
    echo Installer is available in the build directory:
    for %%f in (build\AIB_Installer-v*.exe) do (
        echo %%f
    )
    echo.
    echo Portable version:
    for %%f in (build\AIB_Portable-v*.exe) do (
        echo %%f
    )
    echo =============================================
) else (
    echo Build seems to have completed but no installer file was found.
    echo Check the build directory manually.
)

echo.
echo Build process completed.
endlocal 