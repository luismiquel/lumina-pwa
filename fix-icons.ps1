Set-Location "C:\Users\lm42\lumina-pure-local"

New-Item -ItemType Directory -Force -Path ".\public\icons" | Out-Null

$png192 = "iVBORw0KGgoAAAANSUhEUgAAAMAAAAAwCAIAAACR5j2dAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAwG0G9AABv9p9ygAAAABJRU5ErkJggg=="
[IO.File]::WriteAllBytes((Join-Path (Get-Location) "public\icons\icon-192.png"), [Convert]::FromBase64String($png192))

$png512 = "iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAD7GO4nAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGUlEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAwG0G9AABv9p9ygAAAABJRU5ErkJggg=="
[IO.File]::WriteAllBytes((Join-Path (Get-Location) "public\icons\icon-512.png"), [Convert]::FromBase64String($png512))

Get-ChildItem -Name ".\public\icons\*"
