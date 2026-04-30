---
name: pwsh-modules
description: "PowerShell 7.5 module system — module authoring, manifests, Export-ModuleMember, PSGallery, #Requires, and module scope"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,modules,manifest,psgallery,export,requires,scope"
---

# PowerShell 7.5 Module System

## Golden Rule

**The module manifest (.psd1) is the contract.** It controls what a module exports — not `Export-ModuleMember`. When a manifest with explicit `FunctionsToExport`, `CmdletsToExport`, `VariablesToExport`, and `AliasesToExport` entries exists, those fields determine visibility and override `Export-ModuleMember`.

## Module Types

| Type | Extension | Description |
|------|-----------|-------------|
| Script module | `.psm1` | PowerShell code; most common |
| Module manifest | `.psd1` | Metadata controlling exports; points to RootModule |
| Binary module | `.dll` | Compiled C# cmdlets |
| Dynamic module | (none) | Created at runtime with `New-Module`; not on disk |

A typical module ships as a manifest + script module pair: `MyModule.psd1` + `MyModule.psm1`.

## Creating a Module Manifest

```powershell
New-ModuleManifest -Path ./MyModule/MyModule.psd1 `
    -RootModule 'MyModule.psm1' `
    -ModuleVersion '1.0.0' `
    -Author 'Your Name' `
    -Description 'What this module does' `
    -FunctionsToExport @('Get-Widget', 'Set-Widget', 'Remove-Widget') `
    -CmdletsToExport @() `
    -VariablesToExport @() `
    -AliasesToExport @()
```

### Critical Manifest Fields

| Field | Purpose | Rule |
|-------|---------|------|
| `RootModule` | .psm1 or .dll to load | Required for code modules |
| `ModuleVersion` | Semantic version | Required for PSGallery |
| `FunctionsToExport` | Visible functions | **Explicit list, never `'*'`** |
| `CmdletsToExport` | Visible cmdlets | `@()` if none |
| `VariablesToExport` | Visible variables | `@()` — almost never export |
| `AliasesToExport` | Visible aliases | Explicit list or `@()` |
| `RequiredModules` | Dependencies loaded first | Array of names or specs |
| `NestedModules` | Sub-modules loaded into module scope | Different from RequiredModules |
| `PrivateData.PSData` | PSGallery metadata | Tags, LicenseUri, ProjectUri |

**Why explicit lists matter:** With `FunctionsToExport = '*'`, PowerShell must **load the entire module** to discover commands. With an explicit list, it reads only the manifest, making tab completion and autoloading dramatically faster.

## Export-ModuleMember

Used inside .psm1 to control exports. **The manifest overrides it** when both exist.

When `Export-ModuleMember` matters:
1. **No manifest** — it is the only export control.
2. **Manifest with `'*'` wildcards** — acts as secondary filter.

Without `Export-ModuleMember` and no manifest: all functions export, no variables or aliases export.

```powershell
# MyModule.psm1
function Get-Widget { "public" }
function Set-Widget { param($Name) }
function Initialize-Internal { }  # Helper
$ModuleVersion = '1.0.0'

# Call at END of .psm1, after all functions are defined
Export-ModuleMember -Function 'Get-Widget', 'Set-Widget' -Variable 'ModuleVersion'
```

## Module Scope

Variables in a .psm1 live in the module's scope, separate from the caller.

```powershell
# MyModule.psm1
$script:ConnectionCache = @{}  # Module-private, persists across calls

function Connect-Widget {
    param($Server)
    $script:ConnectionCache[$Server] = [DateTime]::Now
}

function Get-WidgetConnections { $script:ConnectionCache }
```

- `$script:` in a .psm1 = module's top-level scope.
- Not visible to importers unless exported.
- Functions not in `FunctionsToExport` are private but callable within the module.

## $PSModulePath

PowerShell searches these directories for modules:

| Location | Platform | Scope |
|----------|----------|-------|
| `~/.local/share/powershell/Modules` | Linux | Current user |
| `~/Documents/PowerShell/Modules` | Windows | Current user |
| `/usr/local/share/powershell/Modules` | Linux | All users |
| `$PSHOME/Modules` | All | Built-in |

```powershell
# View paths
$env:PSModulePath -split [IO.Path]::PathSeparator

# Add custom path (session only)
$env:PSModulePath += [IO.Path]::PathSeparator + '/opt/custom-modules'
```

### Module Directory Structure

```
Modules/
    MyModule/
        1.0.0/              # Versioned subdirectory (enables side-by-side)
            MyModule.psd1
            MyModule.psm1
        2.0.0/
            MyModule.psd1
            MyModule.psm1
```

## Module Autoloading

Since PS 3.0, modules are auto-imported when you call an exported command. No `Import-Module` needed if:
1. The module is in `$PSModulePath`.
2. The manifest has **explicit** `FunctionsToExport` (not `'*'`).

```powershell
Get-Widget  # PS finds this in MyModule, auto-imports, runs it
```

## #Requires Statement

```powershell
#Requires -Modules @{ ModuleName = 'Az.Accounts'; ModuleVersion = '2.0.0' }
#Requires -Modules PSReadLine
#Requires -Version 7.0
```

- Validates module presence AND imports it before the script runs.
- Fails immediately with a clear error if missing.
- Version constraints: `ModuleVersion` (min), `RequiredVersion` (exact), `MaximumVersion`.

## PSGallery

### Legacy vs Modern Commands

PS 7.5 ships with both PowerShellGet (legacy) and PSResourceGet (modern):

| Legacy | Modern | Purpose |
|--------|--------|---------|
| `Find-Module` | `Find-PSResource` | Search |
| `Install-Module` | `Install-PSResource` | Install |
| `Update-Module` | `Update-PSResource` | Update |
| `Publish-Module` | `Publish-PSResource` | Publish |
| `Uninstall-Module` | `Uninstall-PSResource` | Remove |

Legacy commands work but are slower. See `pwsh-psresourceget` for modern equivalents.

```powershell
# Install for current user (no admin needed)
Install-Module -Name 'Pester' -Scope CurrentUser -Force

# Specific version
Install-Module -Name 'Pester' -RequiredVersion 5.6.1 -Scope CurrentUser
```

## Module Versioning

```powershell
# Side-by-side: multiple versions coexist
Install-Module 'Pester' -RequiredVersion 4.10.1 -Scope CurrentUser
Install-Module 'Pester' -RequiredVersion 5.6.1 -Scope CurrentUser

# Import specific version
Import-Module 'Pester' -RequiredVersion 5.6.1

# Without version params, Import-Module loads the HIGHEST installed version
Import-Module 'Pester'
```

## Module Authoring Best Practices

### Recommended Structure

```
MyModule/1.0.0/
    MyModule.psd1           # Manifest
    MyModule.psm1           # Dot-sources Public/ and Private/
    Public/                 # One function per file
        Get-Widget.ps1
        Set-Widget.ps1
    Private/                # Internal functions
        Initialize-Cache.ps1
```

### Dot-Sourcing Pattern

```powershell
# MyModule.psm1
$Public  = Get-ChildItem "$PSScriptRoot/Public/*.ps1"  -EA SilentlyContinue
$Private = Get-ChildItem "$PSScriptRoot/Private/*.ps1" -EA SilentlyContinue

foreach ($file in @($Public) + @($Private)) {
    try { . $file.FullName }
    catch { Write-Error "Failed to import $($file.FullName): $_" }
}
```

The manifest's `FunctionsToExport` controls which Public functions are visible.

## Import-Module Details

```powershell
Import-Module MyModule -Force     # Reimport (removes and reloads; useful in dev)
Import-Module MyModule -PassThru  # Returns module info object
Import-Module MyModule -DisableNameChecking  # Suppress non-standard verb warnings
```

## Common Mistakes LLMs Make

### Mistake 1: Using Export-ModuleMember When a Manifest Controls Exports
```powershell
# MyModule.psd1: FunctionsToExport = @('Get-Widget')
# MyModule.psm1:
Export-ModuleMember -Function 'Get-Widget', 'Set-Widget'  # Set-Widget still NOT exported!
# The manifest wins. Add Set-Widget to FunctionsToExport in the .psd1.
```

### Mistake 2: Using FunctionsToExport = '*'
```powershell
# BAD — defeats autoloading, exposes internal helpers
@{ FunctionsToExport = '*' }
# GOOD
@{ FunctionsToExport = @('Get-Widget', 'Set-Widget', 'Remove-Widget') }
```

### Mistake 3: Confusing Module Scope with Script/Global Scope
```powershell
# In a .psm1, $script: is the MODULE scope — not the caller's scope
$script:cache = @{}  # Correct: module-level state

# WRONG — using $global: pollutes the session
$global:cache = @{}  # Don't do this for module state
```

### Mistake 4: Forgetting to Update FunctionsToExport After Adding Functions
```powershell
# Added New-Widget to .psm1 but forgot to update manifest:
@{ FunctionsToExport = @('Get-Widget', 'Set-Widget') }  # New-Widget invisible!
# Fix: always update the manifest when adding public functions
```

### Mistake 5: Redundant Import-Module with #Requires
```powershell
# REDUNDANT — #Requires already imports the module
#Requires -Modules Az.Accounts
Import-Module Az.Accounts  # Unnecessary

# CORRECT
#Requires -Modules Az.Accounts
Get-AzContext
```

### Mistake 6: Not Specifying Install-Module Scope
```powershell
# WRONG — default scope varies by platform and elevation
Install-Module Pester  # CurrentUser on Linux, AllUsers if elevated on Windows
# RIGHT — always specify
Install-Module Pester -Scope CurrentUser
```

### Mistake 7: Confusing RequiredModules and NestedModules
```powershell
@{
    RequiredModules = @('Az.Accounts')    # Dependency loaded INDEPENDENTLY, before your module
    NestedModules = @('Helper.psm1')      # Loaded INTO your module's scope
}
# These are NOT interchangeable.
```

### Mistake 8: Assuming Remove-Module Unloads .NET Assemblies
```powershell
Remove-Module MyBinaryModule
# .NET assemblies are STILL in memory — cannot be unloaded from a process
# Must restart the PowerShell session to truly unload them
```

### Mistake 9: Using $PSScriptRoot Wrong in Dot-Sourced Files
```powershell
# In MyModule.psm1: $PSScriptRoot = module root directory
# In Public/Get-Widget.ps1 (dot-sourced): $PSScriptRoot = Public/ directory!

# RIGHT — set a module-level variable in .psm1
$script:ModuleRoot = $PSScriptRoot
# Then in dot-sourced files:
$configPath = Join-Path $script:ModuleRoot 'config.json'
```

### Mistake 10: Publishing Without Checking the Manifest
```powershell
# Always validate before publishing
Test-ModuleManifest ./MyModule/MyModule.psd1
# Checks: FunctionsToExport explicit, Description set, valid version, etc.
```

## Quick Reference

| Task | Command |
|------|---------|
| Create manifest | `New-ModuleManifest -Path ./M/M.psd1 -RootModule M.psm1` |
| Import module | `Import-Module MyModule` |
| Import version | `Import-Module MyModule -RequiredVersion 2.0.0` |
| Reimport (dev) | `Import-Module MyModule -Force` |
| List loaded | `Get-Module` |
| List installed | `Get-Module -ListAvailable` |
| Find on gallery | `Find-Module -Name 'ModName'` |
| Install | `Install-Module ModName -Scope CurrentUser` |
| Validate manifest | `Test-ModuleManifest ./M/M.psd1` |
| Module paths | `$env:PSModulePath -split [IO.Path]::PathSeparator` |
| Require in script | `#Requires -Modules ModName` |
