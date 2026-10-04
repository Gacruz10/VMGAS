@echo off
setlocal
set "BASE=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=[IO.File]::ReadAllText('%~f0'); Invoke-Expression $s.Substring($s.LastIndexOf('#PS#')+4)"
exit /b

#PS#
Add-Type -AssemblyName System.Windows.Forms

$base = $env:BASE.TrimEnd('\')

$dlg = New-Object System.Windows.Forms.FolderBrowserDialog
$dlg.Description = 'Elegi la carpeta a analizar'
$dlg.SelectedPath = $base
$dlg.ShowNewFolderButton = $false

if ($dlg.ShowDialog() -ne 'OK') { Write-Host 'Cancelado.'; return }

$carpeta = $dlg.SelectedPath.TrimEnd('\')
$salida  = Join-Path $base ('listado_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.txt')

$lineas = Get-ChildItem -LiteralPath $carpeta -Recurse -File | Sort-Object FullName | ForEach-Object {
    '{0}  |  Creado: {1:dd/MM/yyyy HH:mm}  |  Modificado: {2:dd/MM/yyyy HH:mm}' -f $_.FullName.Substring($carpeta.Length), $_.CreationTime, $_.LastWriteTime
}

$cabecera = @(
    "Carpeta analizada: $carpeta",
    "Fecha del listado: $(Get-Date -Format 'dd/MM/yyyy HH:mm')",
    "Total de archivos: $(@($lineas).Count)",
    ''
)

($cabecera + $lineas) | Out-File -LiteralPath $salida -Encoding UTF8

$lineas | ForEach-Object { Write-Host $_ }
Write-Host ''
Write-Host "Guardado en: $salida"
Start-Process notepad.exe $salida