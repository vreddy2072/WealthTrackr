Write-Host "Removing node_modules folder..."
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

Write-Host "Removing package-lock.json..."
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

Write-Host "Installing dependencies..."
npm install --legacy-peer-deps

Write-Host "Installation complete. Starting development server..."
npm run dev
