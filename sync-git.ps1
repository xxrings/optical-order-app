Write-Host "=== Git Sync Script ===" -ForegroundColor Green

# Check current status
Write-Host "`nChecking git status..." -ForegroundColor Yellow
$status = git status --porcelain
Write-Host "Status: $status"

Write-Host "`nGetting current branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch"

if ($status) {
    Write-Host "`n=== Changes detected ===" -ForegroundColor Green
    
    # Add all changes
    Write-Host "`nAdding all changes..." -ForegroundColor Yellow
    git add .
    
    # Commit changes
    Write-Host "`nCommitting changes..." -ForegroundColor Yellow
    git commit -m "Fix split lens CPRS export and validation issues"
    
    # Push to current branch
    if ($currentBranch) {
        Write-Host "`nPushing to remote..." -ForegroundColor Yellow
        git push origin $currentBranch
    }
} else {
    Write-Host "`n=== No changes to commit ===" -ForegroundColor Yellow
}

# Show final status
Write-Host "`n=== Final Status ===" -ForegroundColor Green
Write-Host "`nGit status:" -ForegroundColor Yellow
git status

Write-Host "`nAll branches:" -ForegroundColor Yellow
git branch -a
