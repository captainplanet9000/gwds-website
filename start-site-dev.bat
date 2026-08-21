@echo off
setlocal enabledelayedexpansion
echo ==================================================
echo  GWDS Site Dev Server - Start on :3000
echo ==================================================
echo.

echo [1/3] Killing anything on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo     Killing PID %%a
    taskkill /F /T /PID %%a
)
timeout /t 2 /nobreak >nul

echo.
echo [2/3] Wiping .next cache (safer after token changes)...
if exist "C:\GWDS_Site\.next" (
    rmdir /s /q "C:\GWDS_Site\.next" 2>nul
    echo     .next removed.
) else (
    echo     .next already absent.
)

echo.
echo [3/3] Launching npm run dev in a new window...
cd /d "C:\GWDS_Site"
start "GWDS Site Dev (:3000)" cmd /k "npm run dev"

echo.
echo Done. Give webpack ~30s to finish compile, then open:
echo   http://localhost:3000/admin/theme
echo.
timeout /t 5 >nul
exit
