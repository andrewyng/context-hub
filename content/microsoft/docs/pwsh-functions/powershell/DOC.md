---
name: pwsh-functions
description: "PowerShell 7.5 advanced functions — CmdletBinding, parameter validation, parameter sets, ShouldProcess, OutputType, and dynamic parameters"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,functions,cmdletbinding,parameters,validation,shouldprocess"
---

# PowerShell 7.5 Advanced Functions

## Golden Rule

> **Always use `[CmdletBinding()]`.** It transforms a function into an advanced function, enabling `-Verbose`, `-Debug`, `-ErrorAction`, `-ErrorVariable`, `-WarningAction`, `-InformationAction`, `-OutVariable`, `-PipelineVariable`, and more. With `SupportsShouldProcess`, you also get `-WhatIf` and `-Confirm`. The cost is zero.

```powershell
# Simple function — no common parameters
function Get-Thing { param($Name) "Hello $Name" }

# Advanced function — full cmdlet behavior
function Get-Thing {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )
    Write-Verbose "Looking up $Name"
    "Hello $Name"
}
```

## Basic vs Advanced Functions

| Feature | Basic | Advanced ([CmdletBinding()]) |
|---------|-------|------------------------------|
| Common parameters (-Verbose, -Debug, -ErrorAction) | No | Yes |
| `$PSCmdlet` automatic variable | No | Yes |
| ShouldProcess (-WhatIf, -Confirm) | No | Yes |
| Parameter validation attributes | Limited | Full |
| Parameter sets | No | Yes |

### CmdletBinding Placement

`[CmdletBinding()]` MUST be inside the function body, before `param()`:

```powershell
# CORRECT
function Get-Data {
    [CmdletBinding()]
    param([string]$Name)
}

# WRONG: before function keyword — does nothing
[CmdletBinding()]
function Get-Data { param([string]$Name) }

# WRONG: after param — ignored
function Get-Data {
    param([string]$Name)
    [CmdletBinding()]
}
```

### CmdletBinding Attribute Parameters

```powershell
[CmdletBinding(
    SupportsShouldProcess = $true,       # Enables -WhatIf and -Confirm
    ConfirmImpact = 'High',              # Auto-prompts (Low, Medium, High)
    DefaultParameterSetName = 'ByName',  # Default parameter set
    PositionalBinding = $false           # Disables positional binding
)]
```

## Parameter Declaration

### The [Parameter()] Attribute

```powershell
param(
    [Parameter(
        Mandatory,                                    # Prompts if not provided
        Position = 0,                                 # Positional binding index
        ValueFromPipeline,                            # Accepts pipeline input
        ValueFromPipelineByPropertyName,              # Binds by property name
        HelpMessage = 'The server name to query'
    )]
    [string]$ComputerName
)
```

| Property | Purpose |
|----------|---------|
| `Mandatory` | Require the parameter; prompts if missing |
| `Position` | Allow positional binding at this 0-based index |
| `ValueFromPipeline` | Bind entire pipeline object |
| `ValueFromPipelineByPropertyName` | Bind by matching property name |
| `ValueFromRemainingArguments` | Collect all unbound positional args |
| `HelpMessage` | Shown when prompting for mandatory parameter |
| `ParameterSetName` | Assign to a specific parameter set |
| `DontShow` | Hide from tab completion (still usable) |

### Pipeline Input Requires process Block

```powershell
function ConvertTo-Upper {
    [CmdletBinding()]
    param(
        [Parameter(ValueFromPipeline)]
        [string]$Text
    )
    process { Write-Output $Text.ToUpper() }   # Runs once per pipeline item
}
'hello', 'world' | ConvertTo-Upper   # HELLO, WORLD
```

Without `process`, only the **last** pipeline item is processed.

### Type Constraints

```powershell
param(
    [string]$Name,              # Coerces to string
    [int]$Count,                # Errors on non-numeric
    [datetime]$StartDate,       # Parses date strings
    [switch]$Force,             # $true when present, $false when absent
    [string[]]$ComputerName,    # Array of strings
    [pscredential]$Credential   # Prompts securely
)
```

**Critical**: `[switch]` parameters should **never** be `Mandatory`. A switch is `$false` by default and `$true` when present.

## Parameter Validation Attributes

Validation attributes go between `[Parameter()]` and the type constraint:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `[ValidateSet('A','B')]` | Must be listed value | `[ValidateSet('Dev','Staging','Prod')]` |
| `[ValidateRange(1,100)]` | Numeric range (inclusive) | `[ValidateRange(1,365)]` |
| `[ValidatePattern('^re$')]` | Must match regex | `[ValidatePattern('^\d{1,3}(\.\d{1,3}){3}$')]` |
| `[ValidateScript({...})]` | Custom; must return `$true` | `[ValidateScript({ Test-Path $_ })]` |
| `[ValidateLength(1,50)]` | String length range | `[ValidateLength(3,20)]` |
| `[ValidateCount(1,5)]` | Array element count range | `[ValidateCount(1,10)]` |
| `[ValidateNotNull()]` | Cannot be `$null` | |
| `[ValidateNotNullOrEmpty()]` | No `$null`, empty string, or empty array | |
| `[AllowNull()]` | Permits `$null` on Mandatory param | |
| `[AllowEmptyString()]` | Permits `''` on Mandatory `[string]` | |
| `[AllowEmptyCollection()]` | Permits `@()` on Mandatory array | |

`[ValidateSet()]` automatically provides tab completion (case-insensitive in 7.5).

### ValidateScript with Custom Error Messages

```powershell
[ValidateScript({
    if (-not (Test-Path $_)) { throw "Path '$_' does not exist" }
    $true   # Must return $true on success
})]
[string]$ConfigPath
```

Multiple validation attributes stack and ALL must pass.

## Parameter Sets

Parameter sets define mutually exclusive groups. Only one set is active per call:

```powershell
function Get-User {
    [CmdletBinding(DefaultParameterSetName = 'ByName')]
    param(
        [Parameter(Mandatory, ParameterSetName = 'ByName', Position = 0)]
        [string]$Name,

        [Parameter(Mandatory, ParameterSetName = 'ById')]
        [int]$Id,

        [switch]$IncludeDisabled   # No ParameterSetName = available in ALL sets
    )

    switch ($PSCmdlet.ParameterSetName) {
        'ByName' { "Looking up: $Name" }
        'ById'   { "Looking up ID: $Id" }
    }
}

Get-User -Name 'Alice'       # ByName set
Get-User -Id 42              # ById set
# Get-User -Name 'A' -Id 42  # ERROR: cannot mix sets
```

A parameter can belong to multiple sets by applying `[Parameter()]` multiple times.

## ShouldProcess (-WhatIf and -Confirm)

Any function that modifies state should support `-WhatIf` and `-Confirm`:

```powershell
function Remove-OldLogs {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$Path,
        [int]$DaysOld = 30
    )

    $cutoff = (Get-Date).AddDays(-$DaysOld)
    $files = Get-ChildItem $Path -Filter '*.log' | Where-Object { $_.LastWriteTime -lt $cutoff }

    foreach ($file in $files) {
        if ($PSCmdlet.ShouldProcess($file.FullName, 'Delete')) {
            Remove-Item $file.FullName
        }
    }
}

Remove-OldLogs -Path 'C:\Logs' -WhatIf     # Preview only
Remove-OldLogs -Path 'C:\Logs' -Confirm     # Prompt per item
```

**ShouldProcess signatures**: `ShouldProcess($target)`, `ShouldProcess($target, $action)`, `ShouldProcess($verboseDesc, $warning, $caption)`.

**ConfirmImpact** controls auto-prompting: `High` prompts when `$ConfirmPreference` is `High` or `Medium` (default). `Low` never auto-prompts.

**ShouldContinue** is for additional confirmation beyond `-Confirm` (always prompts):

```powershell
if ($PSCmdlet.ShouldProcess($target, 'Delete')) {
    if ($Force -or $PSCmdlet.ShouldContinue("Permanently delete '$target'?", 'Confirm')) {
        Remove-Item $target -Force
    }
}
```

## OutputType

Declares return types (metadata only, not enforced). Enables IntelliSense:

```powershell
function Get-ServerInfo {
    [CmdletBinding()]
    [OutputType([PSCustomObject])]
    param([Parameter(Mandatory)] [string]$ComputerName)
    [PSCustomObject]@{ Name = $ComputerName; Status = 'Online' }
}
```

Multiple types: `[OutputType([string], [int])]`. Per parameter set: `[OutputType([PSCustomObject], ParameterSetName = 'Detailed')]`.

## Dynamic Parameters

Created at runtime via the `dynamicparam` block using `RuntimeDefinedParameterDictionary` and `RuntimeDefinedParameter`. Parameters appear/disappear based on runtime conditions. Access values via `$PSBoundParameters['ParamName']` in the `process` block.

Prefer parameter sets for most mutual-exclusion needs. Reserve dynamic parameters for cases where available parameters genuinely depend on runtime values (e.g., provider-specific parameters).

## Comment-Based Help

Place as the first item inside the function body, before `[CmdletBinding()]`. Keywords: `.SYNOPSIS`, `.DESCRIPTION`, `.PARAMETER <name>`, `.EXAMPLE`, `.NOTES`, `.LINK`.

```powershell
function Verb-Noun {
    <#
    .SYNOPSIS
        Brief description.
    .DESCRIPTION
        Detailed description.
    .PARAMETER Name
        The target name.
    .EXAMPLE
        Verb-Noun -Name 'Example'
        Description of example.
    #>
    [CmdletBinding(SupportsShouldProcess)]
    [OutputType([PSCustomObject])]
    param(
        [Parameter(Mandatory, Position = 0, ValueFromPipeline)]
        [ValidateNotNullOrEmpty()]
        [string]$Name,

        [ValidateRange(1, 100)]
        [int]$Limit = 10,

        [switch]$Force
    )
    begin { Write-Verbose "Starting $($MyInvocation.MyCommand.Name)" }
    process {
        if ($PSCmdlet.ShouldProcess($Name, 'Process')) {
            try { [PSCustomObject]@{ Name = $Name; Processed = $true } }
            catch { $PSCmdlet.WriteError($_) }
        }
    }
    end { Write-Verbose "Finished" }
}
```

## Common Mistakes

### 1. Omitting [CmdletBinding()]
Without it you lose `-Verbose`, `-ErrorAction`, `$PSCmdlet`, and all common parameters.

### 2. CmdletBinding in Wrong Position
Must be inside function body, before `param()`. Not before `function` keyword, not after `param`.

### 3. Making a [switch] Mandatory
A switch is `$false` by default, `$true` when present. `Mandatory` on a switch is a logic error.

### 4. Missing process Block with Pipeline Input
Without `process`, only the last pipeline item is processed. Always use `process` with `ValueFromPipeline`.

### 5. Hallucinating Validation Attributes
These DO NOT EXIST: `[ValidateUrl()]`, `[ValidateEmail()]`, `[ValidateIPAddress()]`, `[ValidateFilePath()]`. Use `[ValidateScript()]` or `[ValidatePattern()]` instead:
```powershell
[ValidateScript({ [uri]::IsWellFormedUriString($_, 'Absolute') })]  # URL
[ValidateScript({ [System.Net.IPAddress]::TryParse($_, [ref]$null) })]  # IP
[ValidateScript({ Test-Path $_ })]  # File path
```

### 6. Accidentally Outputting Unwanted Values
```powershell
# BUG: .Add() returns the index — it goes to output
$list = [System.Collections.ArrayList]::new()
$list.Add('item')    # Outputs 0!

# FIX: Suppress with [void] or $null =
[void]$list.Add('item')
```

### 7. Wrong ShouldProcess Usage
Forgetting `SupportsShouldProcess` in `[CmdletBinding()]` causes a runtime error when calling `$PSCmdlet.ShouldProcess()`. Do NOT use ShouldProcess for read-only functions.

### 8. ValidateScript Not Returning $true
```powershell
# WRONG: returns $null on success — validation always fails
[ValidateScript({ if ($_ -lt 0) { throw "Must be positive" } })]

# CORRECT: explicit $true
[ValidateScript({ if ($_ -lt 0) { throw "Must be positive" }; $true })]
```

### 9. Write-Host for Function Output
`Write-Host` goes to the information stream and cannot be captured or piped. Use implicit output or `Write-Output` for return values. Reserve `Write-Host` for user-facing display only.

### 10. Implicit Positional Binding Without Explicit Position
Without `Position` attributes, positional binding follows declaration order, which is fragile. Either set explicit `Position` values or use `PositionalBinding = $false`.
