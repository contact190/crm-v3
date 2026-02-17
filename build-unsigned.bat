@echo off
REM Disable code signing completely
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

REM Run the build
npm run build:electron
