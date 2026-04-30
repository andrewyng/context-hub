---
name: pwsh-psresourceget
description: "PowerShell 7.5 modern package management — PSResourceGet v1.1, Find-PSResource, Install-PSResource, and migration from PowerShellGet"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,psresourceget,package-management,psgallery,install,publish"
---

# PowerShell 7.5 PSResourceGet (Modern Package Management)

## Golden Rule

**PowerShellGet v2 (`Install-Module`, `Find-Module`) is DEPRECATED.** PowerShell 7.4+ ships with `Microsoft.PowerShell.PSResourceGet` v1.1 as the built-in, default package manager. Use `Install-PSResource`, `Find-PSResource`, and related cmdlets for all package operations.

The old cmdlets still work (for now) via a compatibility layer, but they are slower, buggier, and will be removed. Write new code with PSResourceGet exclusively.

```powershell
# DEPRECATED — do not use in new code
Install-Module -Name Az -Force
Find-Module -Name Pester

# CORRECT — PSResourceGet (built-in from PS 7.4+)
Install-PSResource -Name Az -TrustRepository
Find-PSResource -Name Pester
```

## Command Migration Table

| PowerShellGet v2 (Deprecated) | PSResourceGet v1.1 (Use This) |
|-------------------------------|-------------------------------|
| `Find-Module` | `Find-PSResource` |
| `Find-Script` | `Find-PSResource -Type Script` |
| `Find-DscResource` | `Find-PSResource -Type DscResource` |
| `Find-Command` | `Find-PSResource -Type Command` |
| `Install-Module` | `Install-PSResource` |
| `Install-Script` | `Install-PSResource` |
| `Update-Module` | `Update-PSResource` |
| `Update-Script` | `Update-PSResource` |
| `Uninstall-Module` | `Uninstall-PSResource` |
| `Uninstall-Script` | `Uninstall-PSResource` |
| `Get-InstalledModule` | `Get-InstalledPSResource` |
| `Get-InstalledScript` | `Get-InstalledPSResource` |
| `Publish-Module` | `Publish-PSResource` |
| `Publish-Script` | `Publish-PSResource` |
| `Save-Module` | `Save-PSResource` |
| `Save-Script` | `Save-PSResource` |
| `Register-PSRepository` | `Register-PSResourceRepository` |
| `Unregister-PSRepository` | `Unregister-PSResourceRepository` |
| `Get-PSRepository` | `Get-PSResourceRepository` |
| `Set-PSRepository` | `Set-PSResourceRepository` |

## Finding Resources

### Find-PSResource

```powershell
# Find a module by name
Find-PSResource -Name Pester

# Find with wildcard
Find-PSResource -Name Az.*

# Find by type (Module, Script, Command, DscResource)
Find-PSResource -Name Pester -Type Module
Find-PSResource -Type Script -Tag 'azure'

# Find prerelease versions
Find-PSResource -Name Pester -Prerelease

# Find from a specific repository
Find-PSResource -Name Pester -Repository PSGallery

# Filter by tag
Find-PSResource -Tag 'azure', 'cloud'

# Find specific version (exact)
Find-PSResource -Name Pester -Version '5.6.1'

# Find version range (NuGet syntax)
Find-PSResource -Name Pester -Version '[5.0.0, 6.0.0)'
```

### Version Range Syntax (NuGet Ranges)

PSResourceGet uses NuGet version range notation: `[` = inclusive, `(` = exclusive, `,]` = no upper bound.

| Example | Meaning |
|---------|---------|
| `'5.6.1'` or `'[5.6.1]'` | Exact version |
| `'[5.0.0, 6.0.0)'` | 5.0.0 to 5.x (excludes 6.0.0) |
| `'[4.10.0,]'` | 4.10.0 or higher |
| `'(,2.0.0)'` | Below 2.0.0 |
| `'*'` | Latest stable |

## Installing Resources

### Install-PSResource

```powershell
# Install latest stable version
Install-PSResource -Name Pester

# Install and trust the repository (skip untrusted prompt)
Install-PSResource -Name Pester -TrustRepository

# Install specific version
Install-PSResource -Name Pester -Version '5.6.1'

# Install prerelease
Install-PSResource -Name Pester -Prerelease -TrustRepository

# Install to current user scope (default) or all users
Install-PSResource -Name Pester -Scope CurrentUser
Install-PSResource -Name Pester -Scope AllUsers   # Requires elevation

# Install from specific repository
Install-PSResource -Name MyModule -Repository MyPrivateRepo -TrustRepository

# Reinstall (force reinstall even if already installed)
Install-PSResource -Name Pester -Reinstall

# Install and suppress progress (scripts/automation)
Install-PSResource -Name Pester -TrustRepository -Quiet
```

### Key Differences from Install-Module

No `-Force` (use `-Reinstall`), no `-AllowClobber`, no `-SkipPublisherCheck`. Use `-TrustRepository` to skip trust prompts. Scope defaults to `CurrentUser` even when elevated.

## Updating Resources

```powershell
# Update a specific module
Update-PSResource -Name Pester

# Update all installed resources
Update-PSResource -Name '*'

# Update to a specific version
Update-PSResource -Name Pester -Version '5.7.0'

# Update including prerelease
Update-PSResource -Name Pester -Prerelease
```

## Getting Installed Resources

```powershell
# List all installed resources
Get-InstalledPSResource

# Find specific installed resource
Get-InstalledPSResource -Name Pester

# List all versions of an installed resource
Get-InstalledPSResource -Name Pester -Version '*'

# Filter by scope
Get-InstalledPSResource -Scope CurrentUser
```

## Uninstalling Resources

```powershell
# Uninstall a resource (removes latest installed version)
Uninstall-PSResource -Name OldModule

# Uninstall a specific version
Uninstall-PSResource -Name Pester -Version '4.10.1'

# Uninstall all versions using wildcard range
Uninstall-PSResource -Name Pester -Version '[0.0.0, 99.0.0]'
```

## Saving Resources (Download Without Installing)

```powershell
Save-PSResource -Name Pester -Path './modules' -TrustRepository
Save-PSResource -Name Pester -Version '5.6.1' -Path './modules'
```

## Repository Management

### Viewing Repositories

```powershell
# List all registered repositories
Get-PSResourceRepository

# Get specific repository
Get-PSResourceRepository -Name PSGallery
```

### Registering Repositories

```powershell
# NuGet feed, local share, or local directory — all use -Uri
Register-PSResourceRepository -Name MyRepo -Uri 'https://mynuget.example.com/v3/index.json' -Trusted
Register-PSResourceRepository -Name LocalRepo -Uri '\\fileserver\psrepo' -Trusted

# Trust and priority
Set-PSResourceRepository -Name PSGallery -Trusted
Set-PSResourceRepository -Name MyRepo -Priority 25  # Lower = checked first (PSGallery default: 50)

# Remove a repository (re-register PSGallery with: Register-PSResourceRepository -PSGallery)
Unregister-PSResourceRepository -Name MyRepo
```

## Publishing Resources

```powershell
# Publish module or script (requires .psd1 with Description, Author, ModuleVersion, GUID)
Publish-PSResource -Path './MyModule' -Repository PSGallery -ApiKey $apiKey
Publish-PSResource -Path './MyScript.ps1' -Repository PSGallery -ApiKey $apiKey
```

## Authentication and CI/CD

```powershell
# Private repos: use -Credential with PSCredential (PAT as password for Azure Artifacts)
$cred = [PSCredential]::new('user', (ConvertTo-SecureString 'PAT' -AsPlainText -Force))
Install-PSResource -Name MyModule -Repository AzureFeed -Credential $cred

# CI/CD: trust repo, install quietly, pin versions for reproducibility
Set-PSResourceRepository -Name PSGallery -Trusted
Install-PSResource -Name Pester -Version '[5.6.0]' -Quiet
```

## Common Mistakes

### Mistake 1: Using Install-Module in New Scripts

```powershell
# DEPRECATED — PowerShellGet v2
Install-Module -Name Az -Force -AllowClobber

# CORRECT — PSResourceGet
Install-PSResource -Name Az -TrustRepository -Reinstall
```

### Mistake 2: Using -Force Instead of -TrustRepository or -Reinstall

```powershell
# WRONG — no -Force parameter on Install-PSResource
Install-PSResource -Name Pester -Force  # ERROR: parameter not found

# CORRECT — use -TrustRepository to skip trust prompt
Install-PSResource -Name Pester -TrustRepository

# CORRECT — use -Reinstall to overwrite existing installation
Install-PSResource -Name Pester -Reinstall -TrustRepository
```

### Mistake 3: Using PowerShellGet v2 Version Syntax

```powershell
# WRONG — PowerShellGet v2 syntax doesn't work
Install-PSResource -Name Pester -MinimumVersion '5.0.0' -MaximumVersion '5.99.99'
# ERROR: -MinimumVersion is not a parameter

# CORRECT — use NuGet version range notation
Install-PSResource -Name Pester -Version '[5.0.0, 6.0.0)'

# WRONG — -RequiredVersion doesn't exist
Install-PSResource -Name Pester -RequiredVersion '5.6.1'

# CORRECT — just use -Version with exact version
Install-PSResource -Name Pester -Version '5.6.1'
```

### Mistake 4: Assuming Dependencies Auto-Install

PSResourceGet v1.1 does install dependencies automatically, but it handles them differently from PowerShellGet v2. If a dependency is already installed (any version matching the range), it will not reinstall or update it.

```powershell
# If module Az depends on Az.Accounts >= 3.0.0 and you have 2.x installed:
Install-PSResource -Name Az -TrustRepository
# This WILL install/update Az.Accounts to satisfy the dependency

# To also force-reinstall dependencies, you may need to install them explicitly:
Install-PSResource -Name Az.Accounts -Reinstall -TrustRepository
Install-PSResource -Name Az -TrustRepository
```

### Mistake 5: Using Register-PSRepository Instead of Register-PSResourceRepository

```powershell
# WRONG — old PowerShellGet command (different parameter sets)
Register-PSRepository -Name MyRepo -SourceLocation 'https://...' -PublishLocation 'https://...'

# CORRECT — PSResourceGet uses -Uri (single endpoint)
Register-PSResourceRepository -Name MyRepo -Uri 'https://mynuget.example.com/v3/index.json'
```

### Mistake 6: Not Setting Repository Priority

When multiple repositories are registered, PSResourceGet searches them by priority order (lowest number first). If you have a private repo and PSGallery, modules may resolve from the wrong source.

```powershell
# Set private repo to higher priority (lower number) than PSGallery (default 50)
Set-PSResourceRepository -Name MyPrivateRepo -Priority 25

# Or specify the repository explicitly
Install-PSResource -Name MyModule -Repository MyPrivateRepo -TrustRepository
```

### Mistake 7: Confusing Scope Behavior

```powershell
# Non-elevated: defaults to CurrentUser (same as before)
Install-PSResource -Name Pester  # Goes to CurrentUser

# Elevated: STILL defaults to CurrentUser in PSResourceGet
# (PowerShellGet v2 defaulted to AllUsers when elevated)
Install-PSResource -Name Pester  # Still CurrentUser even when elevated!

# Explicit AllUsers requires elevation
Install-PSResource -Name Pester -Scope AllUsers  # Must be admin/elevated
```

### Mistake 8: Trying to Use -AllowClobber

```powershell
# WRONG — -AllowClobber doesn't exist in PSResourceGet
Install-PSResource -Name SomeModule -AllowClobber

# PSResourceGet handles command name conflicts differently.
# If two modules export the same command, the last imported module wins.
# Use Import-Module -Prefix to namespace them if needed:
Import-Module ModuleA
Import-Module ModuleB -Prefix B  # Commands become Get-BThing instead of Get-Thing
```

### Mistake 9: Publishing Without Required Manifest Fields

```powershell
# This will FAIL — Description is required for publishing
Publish-PSResource -Path './MyModule' -Repository PSGallery -ApiKey $key
# Error: Description is missing from module manifest

# CORRECT — ensure your .psd1 has Description, Author, and ModuleVersion
# Then publish:
Publish-PSResource -Path './MyModule' -Repository PSGallery -ApiKey $key
```

### Mistake 10: Checking PSResourceGet Availability Incorrectly

```powershell
# WRONG — checking for the old module name
if (Get-Module -ListAvailable -Name PowerShellGet) { ... }

# CORRECT — check for PSResourceGet specifically
if (Get-Module -ListAvailable -Name Microsoft.PowerShell.PSResourceGet) {
    # PSResourceGet is available (built-in from PS 7.4+)
    Install-PSResource -Name Pester -TrustRepository
} else {
    # Fallback to PowerShellGet v2 for older PS versions
    Install-Module -Name Pester -Force
}

# Or check by command:
if (Get-Command Install-PSResource -ErrorAction SilentlyContinue) {
    Install-PSResource -Name Pester -TrustRepository
}
```
