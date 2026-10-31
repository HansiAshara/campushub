param(
    [int]$Port = 8081
)

$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($conn in $connections) {
        $procId = $conn.OwningProcess
        if ($procId) {
            try {
                $p = Get-Process -Id $procId -ErrorAction Stop
                Stop-Process -Id $procId -Force -ErrorAction Stop
                Write-Host "Killed process $($p.ProcessName) (PID: $procId) on port $Port"
            } catch {
                Write-Warning "Could not stop process PID ${procId} on port ${Port}: $_"
            }
        }
    }
} else {
    Write-Host "No process found on port $Port"
}
