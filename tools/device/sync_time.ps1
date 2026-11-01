param([string]$Port = '')

$ErrorActionPreference = 'Stop'
try {
    . (Join-Path $PSScriptRoot 'serial_connection.ps1')
    $connection = Resolve-SlateConnection -Port $Port
    Write-Host "Syncing time on $($connection.Port). Close idf.py monitor and other serial tools first."
    & $connection.Python -B (Join-Path $PSScriptRoot 'sync_time.py') --port $connection.Port
    if ($LASTEXITCODE -ne 0) { throw 'Device time synchronization failed; see the message above.' }
    exit 0
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
