$processId = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess
if ($processId) {
    Stop-Process -Id $processId -Force
    Write-Host "Killed process $processId on port 8080"
} else {
    Write-Host "No process found on port 8080"
}