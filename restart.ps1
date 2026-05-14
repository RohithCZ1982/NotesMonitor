
# NotesMonitor - Restart both servers

Write-Host ''
Write-Host '  NotesMonitor - Restarting servers...' -ForegroundColor Cyan
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

Start-Sleep -Seconds 1
Write-Host '  Previous servers stopped.' -ForegroundColor Red
Write-Host ''

Write-Host '  [1/2] Starting Backend  (http://localhost:5000)' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'C:\Softwares\NotesMonitor\backend'; `$host.UI.RawUI.WindowTitle = 'Backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host '  [2/2] Starting Frontend (http://localhost:5173)' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'C:\Softwares\NotesMonitor\frontend'; `$host.UI.RawUI.WindowTitle = 'Frontend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host ''
Write-Host '  Done. Open: http://localhost:5173' -ForegroundColor Cyan
Write-Host ''
