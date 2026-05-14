
# NotesMonitor - Stop both servers

Write-Host ''
Write-Host '  NotesMonitor - Stopping servers...' -ForegroundColor Cyan
Write-Host ''

$ports = @(5000, 5173)
foreach ($port in $ports) {
    $results = netstat -ano | Select-String ":$port\s"
    foreach ($line in $results) {
        $parts = ($line.ToString().Trim() -split '\s+')
        $pid_val = $parts[-1]
        if ($pid_val -match '^\d+$' -and $pid_val -ne '0') {
            try {
                Stop-Process -Id ([int]$pid_val) -Force -ErrorAction SilentlyContinue
                Write-Host "  Stopped PID $pid_val on port $port" -ForegroundColor Red
            } catch {}
        }
    }
}

Write-Host ''
Write-Host '  All servers stopped.' -ForegroundColor Red
Write-Host ''
