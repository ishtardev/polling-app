@echo off
echo Setting up test environment...

echo Installing required dependencies...
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event jest jest-environment-jsdom

echo Creating babel config...
echo { > .babelrc
echo   "presets": ["next/babel"] >> .babelrc
echo } >> .babelrc

echo Updating Jest setup...
echo import '@testing-library/jest-dom'; > jest.setup.js

echo Running tests...
npx jest --detectOpenHandles

echo Done!
