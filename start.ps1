
# NotesMonitor - Start both servers

Write-Host ''
Write-Host '  NotesMonitor - Starting servers...' -ForegroundColor Cyan
Write-Host ''

$ports = @(5000, 5173)
foreach ($port in $ports) {
    $results = netstat -ano | Select-String ":$port\s"
    foreach ($line in $results) {
        $parts = ($line.ToString().Trim() -split '\s+')
        $pid_val = $parts[-1]
        if ($pid_val -match '^\d+$' -and $pid_val -ne '0') {
            try { Stop-Process -Id ([int]$pid_val) -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
}

Write-Host '  [1/2] Starting Backend  (http://localhost:5000)' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'C:\Softwares\NotesMonitor\backend'; `$host.UI.RawUI.WindowTitle = 'Backend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host '  [2/2] Starting Frontend (http://localhost:5173)' -ForegroundColor Green
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'C:\Softwares\NotesMonitor\frontend'; `$host.UI.RawUI.WindowTitle = 'Frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host ''
Write-Host '  Servers launched. Opening browser...' -ForegroundColor Cyan
Write-Host '  Admin  : http://localhost:5173/admin/login' -ForegroundColor Yellow
Write-Host '  Student: http://localhost:5173/login' -ForegroundColor Yellow
Write-Host ''

Start-Process 'http://localhost:5173'
