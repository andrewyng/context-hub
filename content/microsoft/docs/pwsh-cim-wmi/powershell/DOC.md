---
name: pwsh-cim-wmi
description: "PowerShell 7.5 CIM/WMI operations — Get-CimInstance, Invoke-CimMethod, CIM sessions, WMI replacement patterns, and system queries"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,cim,wmi,get-ciminstance,system-management,windows"
---

# PowerShell 7.5 CIM/WMI Operations

## Golden Rule

**`Get-WmiObject` is REMOVED in PowerShell 7.** It does not exist. It is not deprecated — it is gone. Every WMI cmdlet (`Get-WmiObject`, `Invoke-WmiMethod`, `Set-WmiInstance`, `Remove-WmiObject`) was removed. Use the CIM equivalents exclusively.

```powershell
# WRONG — throws CommandNotFoundException in PS7
Get-WmiObject -Class Win32_OperatingSystem

# CORRECT — the only way in PS7
Get-CimInstance -ClassName Win32_OperatingSystem
```

## CIM vs WMI: What Changed

CIM (Common Information Model) cmdlets replaced WMI cmdlets starting in PowerShell 3.0 and became the only option in PowerShell 7.

| Aspect | WMI (Removed) | CIM (Current) |
|--------|---------------|---------------|
| Protocol | DCOM | WS-Man (WinRM) by default |
| Remote firewall | Requires DCOM ports (135 + dynamic) | Port 5985 (HTTP) or 5986 (HTTPS) |
| Object type | Live COM objects with methods | Deserialized CIM instances (no live methods) |
| Method calls | `$obj.MethodName()` | `Invoke-CimMethod` only |
| PowerShell 7 | Removed entirely | Built-in, fully supported |

**Critical difference**: CIM objects are deserialized — you cannot call methods directly on them. You must use `Invoke-CimMethod`.

## Get-CimInstance

The primary cmdlet for querying system information.

### Basic Queries

```powershell
# Query a CIM class
Get-CimInstance -ClassName Win32_OperatingSystem

# Select specific properties (projection — more efficient than Select-Object)
Get-CimInstance -ClassName Win32_Process -Property Name, ProcessId, WorkingSetSize

# Filter with WQL syntax
Get-CimInstance -ClassName Win32_Service -Filter "State = 'Running'"

# Query a non-default namespace
Get-CimInstance -ClassName __Namespace -Namespace 'root'

# Count instances
(Get-CimInstance -ClassName Win32_Process).Count
```

### The -Filter Parameter (WQL Syntax)

Filters use WQL (WMI Query Language) — SQL-like but with specific syntax rules.

```powershell
# String values: single quotes inside double-quoted filter
Get-CimInstance -ClassName Win32_Service -Filter "Name = 'WinRM'"

# LIKE uses % wildcard (not * — this is WQL, not PowerShell)
Get-CimInstance -ClassName Win32_Service -Filter "Name LIKE 'Win%'"

# Multiple conditions with AND/OR
Get-CimInstance -ClassName Win32_Service -Filter "State = 'Running' AND StartMode = 'Auto'"

# IS NULL / IS NOT NULL (not = $null); escape backslashes (double them)
Get-CimInstance -ClassName Win32_Service -Filter "PathName IS NOT NULL"
Get-CimInstance -ClassName Win32_Service -Filter "PathName LIKE '%\\svchost%'"
```

### The -Query Parameter (Full WQL)

```powershell
Get-CimInstance -Query "SELECT Name, ProcessId FROM Win32_Process WHERE Name = 'pwsh.exe'"
Get-CimInstance -Query "ASSOCIATORS OF {Win32_Service.Name='WinRM'} WHERE AssocClass=Win32_DependentService"
```

## Common CIM Classes

### Common CIM Classes Quick Reference

| Class | Key Properties | Notes |
|-------|---------------|-------|
| `Win32_OperatingSystem` | Caption, Version, LastBootUpTime, FreePhysicalMemory | Memory in KB (not bytes!) |
| `Win32_ComputerSystem` | TotalPhysicalMemory (bytes), NumberOfLogicalProcessors, Model, Domain | |
| `Win32_BIOS` | SerialNumber, SMBIOSBIOSVersion | |
| `Win32_Processor` | Name, NumberOfCores, NumberOfLogicalProcessors | |
| `Win32_LogicalDisk` | DeviceID, Size, FreeSpace | Filter: `"DriveType = 3"` for local |
| `Win32_DiskDrive` | Model, Size, MediaType | |
| `Win32_Process` | ProcessId, Name, CommandLine | |
| `Win32_Service` | Name, DisplayName, State, StartMode | |
| `Win32_NetworkAdapterConfiguration` | Description, IPAddress, MACAddress | Filter: `"IPEnabled = TRUE"` |

```powershell
# Example: disk space report
Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType = 3" |
    Select-Object DeviceID, @{N='SizeGB';E={[math]::Round($_.Size/1GB,2)}},
                  @{N='FreeGB';E={[math]::Round($_.FreeSpace/1GB,2)}}
```

### WARNING: Win32_Product

```powershell
# DANGER — Win32_Product triggers MSI reconfiguration of EVERY installed product!
# This is slow (minutes), generates events, and can cause side effects.
# NEVER use this:
Get-CimInstance -ClassName Win32_Product  # BAD — triggers MSI reconfiguration

# Use the registry instead for installed software:
Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' |
    Select-Object DisplayName, DisplayVersion, Publisher |
    Where-Object { $_.DisplayName }

# Also check 32-bit on 64-bit systems:
Get-ItemProperty 'HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*' |
    Select-Object DisplayName, DisplayVersion, Publisher |
    Where-Object { $_.DisplayName }
```

## Invoke-CimMethod

CIM instances are deserialized objects. You cannot call methods on them directly — you must use `Invoke-CimMethod`.

```powershell
# WRONG — CIM objects don't have live methods
$proc = Get-CimInstance -ClassName Win32_Process -Filter "Name = 'notepad.exe'"
$proc.Terminate()  # ERROR: Method invocation failed

# CORRECT — use Invoke-CimMethod on the instance
$proc = Get-CimInstance -ClassName Win32_Process -Filter "Name = 'notepad.exe'"
$proc | Invoke-CimMethod -MethodName Terminate

# CORRECT — use Invoke-CimMethod with class name and arguments
Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
    CommandLine = 'notepad.exe'
}

# Static method on a class (no instance needed)
Invoke-CimMethod -ClassName Win32_OperatingSystem -MethodName Reboot
```

CIM methods return a result object — check `$result.ReturnValue -eq 0` for success.

## CIM Sessions (Remote Management)

```powershell
# Create session (WS-Man/WinRM by default)
$session = New-CimSession -ComputerName 'Server01'
$session = New-CimSession -ComputerName 'Server01' -Credential (Get-Credential)

# DCOM fallback for older systems without WinRM
$session = New-CimSession -ComputerName 'OldServer' -SessionOption (New-CimSessionOption -Protocol Dcom)

# Use session for multiple queries (more efficient than -ComputerName per call)
Get-CimInstance -ClassName Win32_OperatingSystem -CimSession $session
Get-CimInstance -ClassName Win32_Service -CimSession $session

# Always clean up
$session | Remove-CimSession
```

## CIM Associations

Query relationships between CIM objects.

```powershell
# Get the OS instance
$os = Get-CimInstance -ClassName Win32_OperatingSystem

# Find all associated instances
Get-CimAssociatedInstance -CimInstance $os

# Filter by result class
$disk = Get-CimInstance -ClassName Win32_DiskDrive -Filter "Index = 0"
Get-CimAssociatedInstance -CimInstance $disk -ResultClassName Win32_DiskPartition
```

## WMI to CIM Migration Reference

| WMI (Removed in PS7) | CIM (Use This) |
|-----------------------|-----------------|
| `Get-WmiObject` | `Get-CimInstance` |
| `Invoke-WmiMethod` | `Invoke-CimMethod` |
| `Set-WmiInstance` | `Set-CimInstance` |
| `Remove-WmiObject` | `Remove-CimInstance` |
| `Register-WmiEvent` | `Register-CimIndicationEvent` |
| `[wmi]"\\.\root\cimv2:..."` | `Get-CimInstance -Query` |
| `[wmiclass]"..."` | `Get-CimClass` |
| `[wmisearcher]"..."` | `Get-CimInstance -Query` |

**Key differences**: CIM returns proper `[datetime]` (no `ManagementDateTimeConverter` needed). Enumerate properties with `$obj.CimInstanceProperties`.

## Platform Availability

**CIM cmdlets are Windows-only in PowerShell 7.** They are not available on Linux or macOS.

```powershell
# Guard CIM code with platform checks
if ($IsWindows) {
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    Write-Output "Windows: $($os.Caption)"
} else {
    # Use /proc, /sys, or platform tools on Linux
    $osInfo = Get-Content /etc/os-release | ConvertFrom-StringData
    Write-Output "Linux: $($osInfo.PRETTY_NAME)"
}
```

The `CimCmdlets` module ships with PowerShell on Windows but is not present on non-Windows platforms. Attempting to import it on Linux fails.

## Common Mistakes

### Mistake 1: Using Get-WmiObject in PS7

```powershell
# WRONG — Get-WmiObject does not exist in PowerShell 7
Get-WmiObject Win32_OperatingSystem

# CORRECT
Get-CimInstance -ClassName Win32_OperatingSystem
```

### Mistake 2: Calling Methods Directly on CIM Objects

```powershell
# WRONG — CIM objects are deserialized, no live methods
$svc = Get-CimInstance -ClassName Win32_Service -Filter "Name = 'Spooler'"
$svc.StopService()  # FAILS

# CORRECT
$svc | Invoke-CimMethod -MethodName StopService

# Or just use the Service cmdlets for services specifically:
Stop-Service -Name 'Spooler'
```

### Mistake 3: Using PowerShell Wildcards in -Filter

```powershell
# WRONG — WQL uses % not *
Get-CimInstance -ClassName Win32_Service -Filter "Name LIKE 'Win*'"

# CORRECT — WQL LIKE uses % as wildcard
Get-CimInstance -ClassName Win32_Service -Filter "Name LIKE 'Win%'"
```

### Mistake 4: Using $null in WQL Filters

```powershell
# WRONG — WQL doesn't understand PowerShell variables
Get-CimInstance -ClassName Win32_Service -Filter "PathName = $null"

# CORRECT — WQL uses IS NULL
Get-CimInstance -ClassName Win32_Service -Filter "PathName IS NULL"
```

### Mistake 5: Forgetting to Escape Backslashes in WQL

```powershell
# WRONG — single backslash is an escape character in WQL
Get-CimInstance -ClassName Win32_Service -Filter "PathName LIKE '%\svchost%'"

# CORRECT — double the backslashes in WQL string literals
Get-CimInstance -ClassName Win32_Service -Filter "PathName LIKE '%\\svchost%'"
```

### Mistake 6: Using Win32_Product to List Software

```powershell
# WRONG — triggers MSI reconfiguration (slow, has side effects)
Get-CimInstance -ClassName Win32_Product | Where-Object Name -like '*Office*'

# CORRECT — query the registry
Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' |
    Where-Object DisplayName -like '*Office*' |
    Select-Object DisplayName, DisplayVersion
```

### Mistake 7: Assuming CIM Works Cross-Platform

```powershell
# WRONG — this fails on Linux/macOS
Get-CimInstance -ClassName Win32_OperatingSystem

# CORRECT — guard with platform check
if ($IsWindows) {
    Get-CimInstance -ClassName Win32_OperatingSystem
}
```

### Mistake 8: Converting DateTime Properties from CIM

```powershell
# WRONG — unnecessary conversion (this is old WMI pattern)
$os = Get-CimInstance -ClassName Win32_OperatingSystem
$bootTime = [Management.ManagementDateTimeConverter]::ToDateTime($os.LastBootUpTime)

# CORRECT — CIM already returns proper DateTime
$os = Get-CimInstance -ClassName Win32_OperatingSystem
$bootTime = $os.LastBootUpTime  # Already [datetime]
```

### Mistake 9: Not Cleaning Up CIM Sessions

```powershell
# WRONG — session leak
function Get-RemoteInfo {
    $s = New-CimSession -ComputerName $env:COMPUTERNAME
    Get-CimInstance -ClassName Win32_OperatingSystem -CimSession $s
    # session never removed
}

# CORRECT — use try/finally or Remove-CimSession
function Get-RemoteInfo {
    $s = New-CimSession -ComputerName $env:COMPUTERNAME
    try {
        Get-CimInstance -ClassName Win32_OperatingSystem -CimSession $s
    } finally {
        $s | Remove-CimSession
    }
}
```

### Mistake 10: Confusing -Property with Select-Object

```powershell
# INEFFICIENT — retrieves all properties, then filters client-side
Get-CimInstance -ClassName Win32_Process | Select-Object Name, ProcessId

# BETTER — only retrieves specified properties from WMI provider (server-side projection)
Get-CimInstance -ClassName Win32_Process -Property Name, ProcessId

# NOTE: -Property affects the WQL query itself (SELECT Name, ProcessId FROM Win32_Process)
# Other properties will be $null on the returned objects.
```
