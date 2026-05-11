# full-agent-workflow.ps1
# Runs the complete Planner -> Generator -> Healer pipeline.
# Run from the project root: .\full-agent-workflow.ps1

$ErrorActionPreference = 'Stop'
$env:HEADLESS = 'true'

Write-Host '=== Step 1: Bootstrap environment (seed) ===' -ForegroundColor Cyan
npx playwright test seed.spec.ts --project=setup
if (-not $?) { Write-Error 'Seed failed. Fix credentials in .env and retry.'; exit 1 }

Write-Host '=== Step 2: Planner - explore and generate test plans ===' -ForegroundColor Cyan
npx playwright plan `
  --target $env:BASE_URL `
  --output ./test-plans `
  --model claude

Write-Host '=== Step 3: Generator - create spec files from plans ===' -ForegroundColor Cyan
npx playwright generate `
  --plan ./test-plans `
  --output ./specs `
  --import-base fixtures/fixtures.ts `
  --model claude

Write-Host ''
Write-Host '=== Step 4: MANUAL REVIEW REQUIRED ===' -ForegroundColor Yellow
Write-Host 'Review generated specs in .\specs\'
Write-Host 'Copy approved files:  Copy-Item specs\*.spec.ts tests\<subfolder>\'
Write-Host ''
Read-Host 'Press Enter after reviewing and promoting specs to tests/'

Write-Host '=== Step 5: Run full test suite ===' -ForegroundColor Cyan
npx playwright test --project=chromium-auth

Write-Host '=== Step 6: Healer - repair any failures ===' -ForegroundColor Cyan
npx playwright heal `
  --test ./tests `
  --model claude `
  --retries 3 `
  --output ./tests

Write-Host '=== Step 7: Final verification run ===' -ForegroundColor Cyan
npx playwright test --project=chromium-auth

Write-Host '=== Pipeline complete ===' -ForegroundColor Green
