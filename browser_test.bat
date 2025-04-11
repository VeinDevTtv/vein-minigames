@echo off
echo Starting Vein Minigames Browser Testing Mode...
echo.
cd web
echo Installing dependencies (this may take a moment)...
call npm install
echo.
echo Starting development server and opening browser...
call npm run browser-test
echo.
echo If the browser doesn't open automatically, go to:
echo http://localhost:3000?test=true
echo.
echo Press Ctrl+C to stop the server 