---
name: pwsh-script-patterns
description: "PowerShell 7.5 script structure — param blocks, shebang, Set-StrictMode, exit codes, verbose/debug output, dot-sourcing, and script best practices"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,scripts,param,strict-mode,exit-codes,verbose,dot-source"
---

# PowerShell 7.5 Script Structure and Patterns

## Golden Rule

Every script should start with `[CmdletBinding()] param()` even if it takes no parameters. This enables `-Verbose`, `-Debug`, `-ErrorAction`, and all common parameters.

```powershell
# WRONG: Write-Verbose is silent with no way to enable it
Write-Verbose "Starting process"

# CORRECT: caller can use ./script.ps1 -Verbose
[CmdletBinding()]
param()
Write-Verbose "Starting process"
```

## Script Template

```powershell
#!/usr/bin/env pwsh
#Requires -Version 7.4

<#
.SYNOPSIS
    Brief one-line description.
.PARAMETER Name
    Description of the Name parameter.
.EXAMPLE
    ./Deploy-Service.ps1 -Name 'web-api' -Environment Production
#>

[CmdletBinding(SupportsShouldProcess)]
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Name,

    [ValidateSet('Development', 'Staging', 'Production')]
    [string]$Environment = 'Development'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Verbose "Deploying $Name to $Environment"
```

### Why This Order Matters

1. **Shebang** must be the very first line (Linux/macOS execution)
2. **#Requires** directives are checked before ANY code runs
3. **Comment-based help** must immediately precede `param()`
4. **`[CmdletBinding()]` and `param()`** must be the first non-comment code
5. **`Set-StrictMode`** and **`$ErrorActionPreference`** go in the body, after param

## The Shebang Line

```powershell
#!/usr/bin/env pwsh
```

LLMs get these details wrong:
- Must be the FIRST line with NO leading whitespace and NO BOM
- `#!/usr/bin/env pwsh` is correct (finds pwsh on PATH)
- `#!/usr/bin/pwsh` is wrong on many systems
- `#!/usr/bin/env powershell` invokes Windows PowerShell 5.1, not PS7
- File needs Unix line endings (LF) and `chmod +x` on Linux/macOS

## Set-StrictMode

`Set-StrictMode -Version Latest` catches common bugs at runtime:

| Behavior | Without StrictMode | With StrictMode |
|----------|-------------------|-----------------|
| Undefined variable | Returns `$null` | Throws error |
| Nonexistent property | Returns `$null` | Throws error |
| Function called as method `f()` | Calls function | Throws error |

```powershell
Set-StrictMode -Version Latest

$config = Import-Csv './config.csv'
$config[0].Naem   # Typo caught immediately!

# CRITICAL: StrictMode is SCOPED — does NOT inherit into child scopes
function Test-Thing {
    $undefined.Property   # No error! Must set StrictMode inside function too
}
```

### StrictMode Gotcha: Property Existence Checks

```powershell
Set-StrictMode -Version Latest

# WRONG: throws if .Optional doesn't exist
if ($obj.Optional) { ... }

# CORRECT options:
if ($null -ne $obj.PSObject.Properties['Optional']) { ... }
$value = $obj?.Optional   # PS7.1+ null-conditional — returns $null safely
```

## param() Block in Scripts

Scripts use the exact same `param()` syntax as functions. All validation attributes work.

```powershell
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$Name,

    [ValidateSet('Small', 'Medium', 'Large')]
    [string]$Size = 'Medium',

    [ValidateRange(1, 100)]
    [int]$Count = 10,

    [ValidatePattern('^[a-z][a-z0-9-]+$')]
    [string]$Identifier,

    [ValidateScript({ Test-Path $_ -PathType Leaf })]
    [string]$FilePath,

    [switch]$Force
)
```

### Parameter Sets

```powershell
[CmdletBinding(DefaultParameterSetName = 'ByName')]
param(
    [Parameter(Mandatory, ParameterSetName = 'ByName')]  [string]$Name,
    [Parameter(Mandatory, ParameterSetName = 'ById')]    [int]$Id,
    [Parameter()]  [switch]$Detailed   # Available in all sets
)
$PSCmdlet.ParameterSetName   # Check which set was used
```

### Pipeline Input in Scripts

Scripts CAN accept pipeline input. LLMs frequently claim this is impossible.

```powershell
#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(Mandatory, ValueFromPipeline)]
    [string]$Line
)
begin   { $count = 0 }
process { $count++; Write-Output "[$count] $Line" }
end     { Write-Verbose "Processed $count lines" }
```

```powershell
'line1', 'line2', 'line3' | ./Process-Lines.ps1 -Verbose
```

## Exit Codes

### exit Statement

```powershell
exit 0   # Success
exit 1   # Failure

# IMPORTANT: exit terminates the ENTIRE PowerShell process
# In functions, use return or throw instead — exit kills the session
```

### $LASTEXITCODE for Native Commands

```powershell
git clone https://github.com/user/repo.git
if ($LASTEXITCODE -ne 0) {
    Write-Error "git clone failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

# CRITICAL: $LASTEXITCODE persists until the next native command
# Cmdlets do NOT reset it — stale values cause false alarms
Get-ChildItem   # $LASTEXITCODE still holds the git value
```

### $PSNativeCommandUseErrorActionPreference (PS 7.4+)

```powershell
# Native commands now respect $ErrorActionPreference
$PSNativeCommandUseErrorActionPreference = $true
$ErrorActionPreference = 'Stop'

# Non-zero exit codes now THROW (like set -e in bash)
try {
    docker build -t myapp .
}
catch [System.Management.Automation.NativeCommandExitException] {
    Write-Error "Docker build failed: exit code $($_.Exception.ExitCode)"
    exit 1
}
```

### $? (Success Status)

```powershell
Get-Item './missing.txt' -ErrorAction SilentlyContinue
$saved = $?   # MUST save immediately — next statement resets $?
if (-not $saved) { Write-Warning 'File not found' }
```

### CI Exit Code Pattern

```powershell
#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
try {
    dotnet test ./MyProject.Tests
    dotnet publish -c Release -o ./output
}
catch { Write-Error $_.Exception.Message; exit 1 }
exit 0
```

## Verbose and Debug Output

```powershell
[CmdletBinding()]
param()

Write-Verbose "Connecting to $server"           # Shown with -Verbose
Write-Debug "Variable state: x=$x"              # Shown with -Debug (pauses!)
Write-Information "Processing started" -Tags 'status'  # Shown with -InformationAction Continue

# Preference variables:
$VerbosePreference = 'Continue'       # Show verbose globally
$DebugPreference = 'Continue'         # Show debug WITHOUT pausing
$DebugPreference = 'Inquire'          # Show debug AND pause (default)
```

### -Verbose Inheritance

In PS7, `-Verbose` propagates to functions in the same script/module. It does NOT propagate across module boundaries. To pass explicitly: `Get-Data -Verbose:$VerbosePreference`.

## Dot-Sourcing vs Module Import

```powershell
# Dot-source: runs IN current scope — functions and variables leak in
. ./helpers.ps1
Invoke-HelperFunction   # Available directly

# Regular invoke: CHILD scope — nothing leaks
./helpers.ps1
# Functions from helpers.ps1 NOT available here

# Module import: isolated scope, only exports visible
Import-Module ./MyModule.psm1
Remove-Module MyModule; Import-Module ./MyModule.psm1 -Force  # Reload
```

| Aspect | Dot-Source | Module Import |
|--------|-----------|---------------|
| Scope | Caller's scope | Isolated module scope |
| Variables | Leak into caller | Encapsulated |
| Functions | All visible | Only exported |
| Use case | Script helpers | Reusable libraries |

## #Requires Directive

Checked BEFORE the script runs. They are NOT comments despite the `#` prefix.

```powershell
#Requires -Version 7.4
#Requires -Modules Az.Accounts
#Requires -Modules @{ ModuleName = 'Pester'; RequiredVersion = '5.5.0' }
#Requires -RunAsAdministrator
#Requires -PSEdition Core
```

Key details:
- Can appear on any line, but convention is at the top
- Multiple `#Requires` are ALL enforced (AND logic)
- `-Modules` auto-loads the module if installed
- NOT supported inside functions (script-level only)

## Execution Policy

```powershell
Get-ExecutionPolicy -List
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# CI: bypass without persisting
pwsh -ExecutionPolicy Bypass -File ./deploy.ps1

# CRITICAL: on Linux/macOS, execution policy defaults to Unrestricted
# File permissions (chmod) are the real gate — not execution policy
```

## $PSScriptRoot and $PSCommandPath

```powershell
$config = Get-Content (Join-Path $PSScriptRoot 'config.json') | ConvertFrom-Json
. (Join-Path $PSScriptRoot 'helpers.ps1')

# GOTCHA: $PSScriptRoot is EMPTY in interactive sessions
# GOTCHA: in .psm1 files, $PSScriptRoot is the module directory, not caller's
```

## begin/process/end in Scripts

Scripts support pipeline blocks just like functions.

```powershell
#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [Parameter(ValueFromPipeline)] [string]$InputObject,
    [switch]$Upper
)
begin   { $count = 0 }
process { $count++; if ($Upper) { $InputObject.ToUpper() } else { $InputObject } }
end     { Write-Verbose "Processed $count items" }
```

**Important**: Without `begin/process/end`, the entire script body is an implicit `end` block. Pipeline input is collected into `$input` as an array, NOT processed one-at-a-time.

## SupportsShouldProcess

```powershell
[CmdletBinding(SupportsShouldProcess)]
param([Parameter(Mandatory)] [string]$Path)

if ($PSCmdlet.ShouldProcess($Path, 'Delete file')) {
    Remove-Item -Path $Path
}
# Callers get -WhatIf (preview) and -Confirm (prompt) automatically
```

## Common Mistakes

### 1: Missing [CmdletBinding()] param()
Without it, `-Verbose`, `-Debug`, and `-ErrorAction` are not available to callers.

### 2: Wrong shebang
`#!/usr/bin/pwsh` (not portable), `#!/usr/bin/env powershell` (invokes PS 5.1), or shebang not on line 1.

### 3: Set-StrictMode before param()
```powershell
# WRONG: causes parse error     # CORRECT
Set-StrictMode -Version Latest   [CmdletBinding()]
[CmdletBinding()]                param()
param()                          Set-StrictMode -Version Latest
```

### 4: Using exit in functions
`exit` terminates the entire PowerShell process. In functions, use `throw` or `return`.

### 5: Not saving $? immediately
`$?` is reset by every statement including assignments. Save it on the very next line.

### 6: Assuming $LASTEXITCODE resets after cmdlets
Cmdlets do NOT reset `$LASTEXITCODE`. Check it immediately after native commands or reset manually.

### 7: Dot-sourcing when you want isolation
`. ./setup.ps1` leaks all variables into your scope. Use `./setup.ps1` or `Import-Module` for isolation.

### 8: Expecting StrictMode to inherit into child scopes
StrictMode is scoped. Functions do NOT inherit it. Set `Set-StrictMode -Version Latest` inside each function.

### 9: Using Write-Host for output data
```powershell
function Get-Name { Write-Host "server-01" }
$name = Get-Name   # $null! Write-Host is display-only

function Get-Name { "server-01" }   # Implicit Write-Output
$name = Get-Name   # "server-01"
```

### 10: #Requires inside a function
`#Requires` is silently ignored inside functions. It only works at script level.
