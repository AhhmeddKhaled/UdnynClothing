@echo off
cd /d "%~dp0"

echo ==============================
echo     UdnynClothing Git Push
echo ==============================

echo.
echo [1/3] Adding files...
git add .

echo.
echo [2/3] Creating commit...
git commit -m "Update project"

echo.
echo [3/3] Pushing to GitHub...
git push

echo.
echo ==============================
echo        Push completed
echo ==============================

pause