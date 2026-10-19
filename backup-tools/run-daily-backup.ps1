$ErrorActionPreference = "Stop"
$Project = "C:\Users\Admin\Desktop\TourPackageMaker"
$BackupDir = "C:\OrbitzBackups\Daily"
$LogDir = Join-Path $BackupDir "logs"
New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
$Log = Join-Path $LogDir ("backup-run-" + (Get-Date -Format "yyyy-MM-dd_HH-mm-ss") + ".log")

try {
    Remove-Item Env:FIRESTORE_EMULATOR_HOST -ErrorAction SilentlyContinue
    Set-Location $Project
    "Started: $(Get-Date -Format o)" | Out-File $Log
    "Running daily JSON + XLSX backup." | Out-File $Log -Append
    & node ".\backup-tools\run-structured-backup-v2.mjs" *>&1 |
        Tee-Object -FilePath $Log -Append
    $Code = $LASTEXITCODE
    "Exit code: $Code" | Out-File $Log -Append
    "Finished: $(Get-Date -Format o)" | Out-File $Log -Append
    exit $Code
}
catch {
    $_ | Out-String | Out-File $Log -Append
    exit 1
}

