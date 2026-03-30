---
name: pwsh-crossplatform
description: "PowerShell 7.5 cross-platform differences — Linux/macOS compatibility, path handling, environment variables, and platform-specific features"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,crossplatform,linux,macos,windows,paths,compatibility"
---

# PowerShell 7.5 — Cross-Platform Differences

## Golden Rule

**Use `Join-Path` and `[IO.Path]` methods for all path operations. NEVER hardcode
path separators.** Hardcoded `\` is the #1 source of cross-platform breakage.

```powershell
# WRONG — breaks on Linux/macOS
$configPath = "$env:USERPROFILE\AppData\config.json"

# RIGHT — works everywhere
$configPath = Join-Path $HOME '.config' 'app' 'settings.json'
```

---

## Platform Detection

PS 7+ provides three automatic booleans. These do **NOT** exist in PS 5.1.

| Variable | Windows | Linux | macOS |
|----------|---------|-------|-------|
| `$IsWindows` | `$true` | `$false` | `$false` |
| `$IsLinux` | `$false` | `$true` | `$false` |
| `$IsMacOS` | `$false` | `$false` | `$true` |

```powershell
# CRITICAL: $IsWindows does not exist in PS 5.1 — evaluates to $null (falsy)
# So if ($IsWindows) { ... } is NEVER TRUE in PS 5.1, even on Windows!

# Version-safe check for scripts that may run on PS 5.1 or PS 7:
if ($PSVersionTable.PSVersion.Major -lt 6 -or $IsWindows) {
    # Windows code path
}

# .NET one-liner that works in both PS 5.1 and PS 7:
$onWindows = [Runtime.InteropServices.RuntimeInformation]::IsOSPlatform(
    [Runtime.InteropServices.OSPlatform]::Windows
)
```

### Platform-Conditional Logic

```powershell
$configDir = if ($IsWindows) {
    Join-Path $env:APPDATA 'MyApp'
} elseif ($IsMacOS) {
    Join-Path $HOME 'Library' 'Application Support' 'MyApp'
} else {
    Join-Path $HOME '.config' 'myapp'
}
```

---

## Path Handling

### Forward Slash Works Everywhere — Backslash Does NOT

```powershell
# / works on ALL platforms including Windows in PS 7
Get-ChildItem C:/Users          # Works on Windows
Test-Path C:/Windows/System32   # Works on Windows

# \ does NOT work on Linux/macOS — it's a valid filename character there
Get-ChildItem /home\user        # FAILS on Linux
Test-Path \tmp\file.txt         # FAILS on Linux
```

### Join-Path Is Variadic in PS 7

```powershell
# PS 5.1 — only two arguments
$path = Join-Path (Join-Path $root 'sub') 'file.txt'

# PS 7+ — unlimited arguments
$path = Join-Path $root 'sub1' 'sub2' 'file.txt'
```

### [System.IO.Path] Methods

```powershell
[IO.Path]::DirectorySeparatorChar   # '\' on Windows, '/' on Linux/macOS
[IO.Path]::PathSeparator            # ';' on Windows, ':' on Linux/macOS
[IO.Path]::Combine($HOME, '.config', 'app')
[IO.Path]::GetTempPath()            # C:\Users\...\Temp\ or /tmp/
[IO.Path]::GetFullPath('./relative/path')

# GOTCHA: Combine drops earlier args if a later one is rooted
[IO.Path]::Combine('C:\base', '/absolute')   # Returns "/absolute"!
# Join-Path has the same behavior — by design, not a bug
```

### Home Directory

```powershell
# $HOME works on ALL platforms in PS 7 — always use it
$configFile = Join-Path $HOME '.myapp' 'config.json'

# WRONG — platform-specific env vars
Join-Path $env:USERPROFILE '.myapp' 'config.json'  # Null on Linux
Join-Path $env:HOME '.myapp' 'config.json'          # Null on some Windows
```

---

## Environment Variables

### Platform Differences

| Purpose | Windows | Linux/macOS |
|---------|---------|-------------|
| Home dir | `$env:USERPROFILE` | `$env:HOME` |
| Temp dir | `$env:TEMP` | `$env:TMPDIR` (macOS) or `/tmp` |
| Username | `$env:USERNAME` | `$env:USER` |
| Hostname | `$env:COMPUTERNAME` | `$env:HOSTNAME` (may be empty) |
| PATH sep | `;` (semicolon) | `:` (colon) |

### PATH Manipulation

```powershell
# WRONG — hardcoded separators
$env:PATH += ";C:\mytools"       # Breaks on Linux
$env:PATH += ":/usr/local/bin"   # Breaks on Windows

# RIGHT — platform separator
$env:PATH += [IO.Path]::PathSeparator + '/usr/local/mytools'

# Split PATH into array
$paths = $env:PATH -split [regex]::Escape([IO.Path]::PathSeparator)
```

### Persistent Environment Variables

```powershell
$env:MY_VAR = "value"    # Session only — works everywhere

# Persistent — platform specific
if ($IsWindows) {
    [Environment]::SetEnvironmentVariable('MY_VAR', 'value', 'User')
} else {
    # No built-in mechanism — write to profile
    Add-Content $PROFILE.CurrentUserAllHosts '$env:MY_VAR = "value"'
}
```

---

## Windows-Only Features

These throw errors on Linux/macOS. Guard with `if ($IsWindows)`.

### Registry Provider
```powershell
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion'
# Linux: "Cannot find drive. A drive with the name 'HKLM' does not exist."
```

### CIM (replaces WMI — Get-WmiObject removed in PS 7)
```powershell
Get-CimInstance Win32_OperatingSystem
Get-CimInstance Win32_Service
# Linux: "CIM operations are not supported on this platform."
```

### Windows Services
```powershell
Get-Service; Start-Service 'wuauserv'; Stop-Service 'Spooler'
# Linux alternative: & systemctl status sshd
```

### Event Log
```powershell
Get-WinEvent -LogName System -MaxEvents 10
# Linux alternative: & journalctl -u nginx --since '1 hour ago'
```

### Other Windows-Only Features
- **Group Policy**: `Get-GPO`, `Set-GPRegistryValue`
- **Scheduled Tasks**: `Get-ScheduledTask`, `Register-ScheduledTask`
- **DCOM**: `-Protocol DCOM` on CIM cmdlets
- **Clipboard**: `Get-Clipboard`/`Set-Clipboard` work on Windows natively; Linux
  needs `xclip`/`xsel`; macOS uses `pbcopy`/`pbpaste`

---

## Linux/macOS Specifics

### Case-Sensitive Filesystem

```powershell
# Linux filesystems are case-sensitive (macOS APFS is not, like Windows)
Test-Path ./README.md      # True
Test-Path ./readme.md      # FALSE on Linux — different file!

# Import-Module is case-sensitive on Linux
Import-Module ./MyModule.psm1     # Works
Import-Module ./mymodule.psm1     # FAILS if file is MyModule.psm1

# PowerShell hashtables are always case-insensitive regardless of OS
$ht = @{}; $ht['Key'] = 1; $ht['key']   # Returns 1
```

### File Permissions

```powershell
# PowerShell has NO native cmdlets for Unix permissions — use native commands
if (-not $IsWindows) {
    & chmod 755 ./script.sh
    & chmod 600 ./secrets.conf
    & chown 'user:group' ./file.txt
}
# There is no .IsExecutable property on FileInfo
```

### Configuration File Locations

```powershell
# Profile locations differ by platform
$PROFILE
# Windows: ~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
# Linux:   ~/.config/powershell/Microsoft.PowerShell_profile.ps1
# macOS:   ~/.config/powershell/Microsoft.PowerShell_profile.ps1

# Module paths
$env:PSModulePath -split [IO.Path]::PathSeparator
# Windows: ~\Documents\PowerShell\Modules; C:\Program Files\PowerShell\Modules; ...
# Linux:   ~/.local/share/powershell/Modules:/usr/local/share/powershell/Modules:...
```

### Systemd Integration

```powershell
# Run pwsh as a systemd service: ExecStart=/usr/bin/pwsh -File /opt/myapp/run.ps1
if ($IsLinux) {
    & systemctl is-active --quiet nginx
    if ($LASTEXITCODE -eq 0) { Write-Host "nginx is running" }
}
```

---

## Line Endings

| Platform | Default | Escape |
|----------|---------|--------|
| Windows | CRLF (`\r\n`) | `` "`r`n" `` |
| Linux/macOS | LF (`\n`) | `` "`n" `` |

```powershell
# Use [Environment]::NewLine for platform-correct endings
$text = "Line 1" + [Environment]::NewLine + "Line 2"

# Always split with regex that handles both
$lines = $text -split '\r?\n'

# GOTCHA: Get-Content -Raw preserves original endings, but
# Set-Content writes platform-native endings — round-tripping changes endings!
$text = Get-Content file.txt -Raw    # Keeps original \r\n or \n
$text | Set-Content file.txt         # Rewrites with platform endings

# Fix in .gitattributes: * text=auto eol=lf
```

---

## Executable Resolution

```powershell
# Windows: searches PATHEXT (.exe, .cmd, .bat, .com, .ps1)
# Linux/macOS: exact filename only (no extension appending)

& git.exe status    # WRONG on Linux — no .exe
& git status        # RIGHT — works everywhere

# Running scripts in current directory
.\script.ps1        # Windows only (\ is not a path separator on Linux)
./script.ps1        # Works everywhere

# Shebang for direct execution on Linux/macOS
#!/usr/bin/env pwsh
# (Harmless on Windows — starts with #, treated as comment)
# chmod +x ./script.ps1 to make it executable
```

### Native Command Output

```powershell
# Native commands return strings, not objects
$result = & hostname              # [string]
$result = & ls -la                # [string[]] — one per line

# Parse structured output explicitly
$containers = & docker ps --format '{{json .}}' | ConvertFrom-Json

# Exit codes: $LASTEXITCODE persists until next native command
& some-tool --check
if ($LASTEXITCODE -ne 0) { Write-Error "Failed: exit $LASTEXITCODE" }

# $? resets after ANY statement — $LASTEXITCODE is more reliable
```

---

## $PSModulePath Differences

```powershell
$env:PSModulePath -split [IO.Path]::PathSeparator

# Windows: ~\Documents\PowerShell\Modules; C:\Program Files\PowerShell\7\Modules; ...
# Linux:   ~/.local/share/powershell/Modules:/opt/microsoft/powershell/7/Modules:...
# macOS:   ~/.local/share/powershell/Modules:/opt/microsoft/powershell/7/Modules:...

# Install modules to user scope (no admin, cross-platform)
Install-Module -Name PSReadLine -Scope CurrentUser
```

---

## Common Mistakes LLMs Make

### 1. Hardcoding backslash path separators
```powershell
$path = "$HOME\Documents\file.txt"    # WRONG — \ is literal on Linux
$path = Join-Path $HOME 'Documents' 'file.txt'  # RIGHT
```

### 2. Using $env:USERPROFILE on Linux (it's null)
```powershell
Join-Path $env:USERPROFILE '.config'   # WRONG — null on Linux
Join-Path $HOME '.config'              # RIGHT — works everywhere
```

### 3. Using CIM/WMI in cross-platform scripts
```powershell
$os = Get-CimInstance Win32_OperatingSystem   # CRASHES on Linux
# Guard with: if ($IsWindows) { ... } else { & uname -o }
```

### 4. Assuming $IsWindows exists in PS 5.1
```powershell
if ($IsWindows) { ... }   # NEVER TRUE in PS 5.1 ($IsWindows is undefined/null)
# Fix: if ($PSVersionTable.PSVersion.Major -lt 6 -or $IsWindows) { ... }
```

### 5. Hardcoding PATH separator
```powershell
$env:PATH += ";/usr/local/bin"                            # WRONG
$env:PATH += [IO.Path]::PathSeparator + '/usr/local/bin'  # RIGHT
```

### 6. Using .exe extension in cross-platform scripts
```powershell
& git.exe status       # WRONG on Linux
& git status           # RIGHT — PS resolves .exe on Windows automatically
```

### 7. Assuming case-insensitive filesystem
```powershell
Test-Path './Config.JSON'    # FALSE on Linux if file is config.json
# Use exact case or case-insensitive -like filter:
Get-ChildItem . | Where-Object { $_.Name -like 'config.json' }
```

### 8. Using Windows-specific paths without guards
```powershell
$logPath = 'C:\Logs\app.log'    # WRONG — C:\ doesn't exist on Linux
$logPath = if ($IsWindows) {
    Join-Path $env:ProgramData 'MyApp' 'Logs' 'app.log'
} else {
    Join-Path '/var/log' 'myapp' 'app.log'
}
```

### 9. Relying on Windows line endings
```powershell
$lines = $text -split "`r`n"    # WRONG — misses LF-only on Linux
$lines = $text -split '\r?\n'   # RIGHT — handles both
```

### 10. Using Registry provider in cross-platform modules
```powershell
# WRONG — fails on Linux/macOS
Get-ItemProperty 'HKCU:\Software\MyApp' -Name 'Setting'

# RIGHT — abstract storage
if ($IsWindows) {
    (Get-ItemProperty 'HKCU:\Software\MyApp' -Name 'Setting').Setting
} else {
    $f = Join-Path $HOME '.config' 'myapp' 'settings.json'
    if (Test-Path $f) { (Get-Content $f -Raw | ConvertFrom-Json).Setting }
}
```
