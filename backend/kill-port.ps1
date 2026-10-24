param(
    [int]$Port = 8081
)

$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $pId = $conn.OwningProcess
        if ($pId) {
            try {
                $p = Get-Process -Id $pId -ErrorAction Stop
                Stop-Process -Id $pId -Force -ErrorAction Stop
                Write-Host "Killed process $($p.ProcessName) (PID: $pId) on port $Port"
            } catch {
                Write-Warning "Could not stop process PID $pId on port ${Port}: $_"
            }
        }
    }
} else {
    Write-Host "No process found on port $Port"
}