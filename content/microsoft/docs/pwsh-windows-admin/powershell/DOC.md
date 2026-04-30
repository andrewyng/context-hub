---
name: pwsh-windows-admin
description: "PowerShell 7.5 Windows administration — scheduled tasks, event logs, networking, firewall, services, and Windows-only module reference"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,windows,admin,scheduled-tasks,event-log,firewall,services,networking"
---

# PowerShell 7.5 Windows Administration

## Golden Rule

**These modules are WINDOWS-ONLY.** They do not exist on Linux or macOS. Every cmdlet in this document requires Windows. Always check `$IsWindows` before using them in cross-platform scripts.

```powershell
# Guard all Windows-only code
if (-not $IsWindows) {
    Write-Error "This script requires Windows."
    return
}
```

**Second golden rule**: `Get-EventLog` is REMOVED in PowerShell 7. Use `Get-WinEvent` exclusively.

## Event Logs (Get-WinEvent)

### Get-EventLog is Gone

```powershell
# WRONG — removed in PowerShell 7
Get-EventLog -LogName System -Newest 10
Get-EventLog -LogName Application -EntryType Error

# CORRECT — Get-WinEvent is the replacement
Get-WinEvent -LogName System -MaxEvents 10
Get-WinEvent -FilterHashtable @{ LogName = 'Application'; Level = 2 } -MaxEvents 10
```

### FilterHashtable (Preferred — Server-Side Filtering)

```powershell
# Level values: 1=Critical, 2=Error, 3=Warning, 4=Informational, 5=Verbose
Get-WinEvent -FilterHashtable @{
    LogName = 'System'
    ID      = 6005, 6006, 6008   # Startup, clean shutdown, unexpected shutdown
}

Get-WinEvent -FilterHashtable @{
    LogName   = 'Security'
    ID        = 4625             # Failed logon
    StartTime = (Get-Date).AddDays(-1)
} -MaxEvents 50

Get-WinEvent -FilterHashtable @{
    LogName = 'Application'
    Level   = 1, 2               # Critical and Error only
}
```

### FilterXPath (Advanced Queries)

```powershell
# XPath for specific event data fields (when FilterHashtable cannot express the query)
Get-WinEvent -LogName 'Security' -FilterXPath "*[System[(EventID=4624)]] and *[EventData[Data[@Name='LogonType']='10']]" -MaxEvents 10
```

### Extracting Event Data

Access structured data via `$_.Properties[n].Value` — index positions vary by event ID (check event XML for field order).

## Scheduled Tasks

### Querying Tasks

```powershell
# List all scheduled tasks
Get-ScheduledTask

# Filter by state
Get-ScheduledTask | Where-Object State -eq 'Ready'

# Get task in specific folder
Get-ScheduledTask -TaskPath '\Microsoft\Windows\WindowsUpdate\'

# Get task details with info
Get-ScheduledTask -TaskName 'MyTask' | Get-ScheduledTaskInfo
# Returns: LastRunTime, LastTaskResult, NextRunTime, NumberOfMissedRuns
```

### Creating Scheduled Tasks

```powershell
# Step 1: Create the action (what to run)
$action = New-ScheduledTaskAction -Execute 'pwsh.exe' -Argument '-NoProfile -File C:\Scripts\Backup.ps1'

# Step 2: Create the trigger (when to run)
# Daily at 2 AM
$trigger = New-ScheduledTaskTrigger -Daily -At '2:00 AM'

# Weekly on Monday at 6 AM
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At '6:00 AM'

# At startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# At logon
$trigger = New-ScheduledTaskTrigger -AtLogon

# One-time
$trigger = New-ScheduledTaskTrigger -Once -At '2026-04-01 09:00:00'

# Step 3: Create settings (optional)
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Step 4: Create principal (run as)
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

# Step 5: Register the task
Register-ScheduledTask -TaskName 'MyBackupTask' -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'Daily backup script'
```

### Modifying and Running Tasks

```powershell
# Run a task immediately
Start-ScheduledTask -TaskName 'MyBackupTask'

# Stop a running task
Stop-ScheduledTask -TaskName 'MyBackupTask'

# Disable a task
Disable-ScheduledTask -TaskName 'MyBackupTask'

# Enable a task
Enable-ScheduledTask -TaskName 'MyBackupTask'

# Update a task's trigger
$newTrigger = New-ScheduledTaskTrigger -Daily -At '3:00 AM'
Set-ScheduledTask -TaskName 'MyBackupTask' -Trigger $newTrigger

# Remove a task
Unregister-ScheduledTask -TaskName 'MyBackupTask' -Confirm:$false
```

## Windows Services

```powershell
# Query
Get-Service -Name 'WinRM'
Get-Service | Where-Object Status -eq 'Running'
Get-Service -Name 'WinRM' -DependentServices    # Services depending on it
Get-Service -Name 'WinRM' -RequiredServices      # Services it depends on

# Manage
Start-Service -Name 'WinRM'
Stop-Service -Name 'Spooler' -Force              # -Force stops dependents too
Restart-Service -Name 'WinRM'
Set-Service -Name 'Spooler' -StartupType Automatic  # or Disabled, Manual

# Create / remove
New-Service -Name 'MyService' -BinaryPathName 'C:\MyApp\service.exe' -DisplayName 'My Service' -StartupType Automatic
Remove-Service -Name 'MyService'  # PS 7+
```

## Networking

### Test-NetConnection (Not Test-Connection for TCP)

```powershell
# ICMP ping (cross-platform)
Test-Connection -TargetName 'server01' -Count 4

# TCP port test (Windows-only — use .NET TcpClient on Linux)
Test-NetConnection -ComputerName 'server01' -Port 443
Test-NetConnection -ComputerName 'server01' -Port 443 -InformationLevel Quiet  # Returns $true/$false
Test-NetConnection -ComputerName '8.8.8.8' -TraceRoute
```

### Network Adapter Management

```powershell
# Adapters, IPs, routes
Get-NetAdapter | Where-Object Status -eq 'Up' | Get-NetIPAddress
Get-NetIPAddress -AddressFamily IPv4 | Where-Object IPAddress -notlike '127.*'
Get-NetRoute -DestinationPrefix '0.0.0.0/0'   # Default gateway

# DNS
Resolve-DnsName -Name 'google.com' -Type A
Get-DnsClientServerAddress -AddressFamily IPv4

# Set static IP and DNS (requires elevation)
New-NetIPAddress -InterfaceAlias 'Ethernet' -IPAddress '192.168.1.100' -PrefixLength 24 -DefaultGateway '192.168.1.1'
Set-DnsClientServerAddress -InterfaceAlias 'Ethernet' -ServerAddresses '8.8.8.8', '8.8.4.4'
```

## Windows Firewall (NetSecurity Module)

```powershell
# Query rules
Get-NetFirewallRule -Direction Inbound -Enabled True | Select-Object DisplayName, Action, Profile
Get-NetFirewallRule -DisplayName '*Remote Desktop*'

# Create, modify, remove rules
New-NetFirewallRule -DisplayName 'Allow SSH' -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow -Profile Domain, Private
Set-NetFirewallRule -DisplayName 'Allow SSH' -Enabled False
Remove-NetFirewallRule -DisplayName 'Allow SSH'

# Profile settings (CAUTION: disabling is dangerous)
Get-NetFirewallProfile
```

## Windows Features

```powershell
# Server OS: Get-WindowsFeature / Install-WindowsFeature / Uninstall-WindowsFeature
Install-WindowsFeature -Name 'Web-Server' -IncludeManagementTools

# Client (Win10/11): Get-WindowsOptionalFeature / Enable-WindowsOptionalFeature
Enable-WindowsOptionalFeature -Online -FeatureName 'Microsoft-Hyper-V-All' -All
```

## Windows Compatibility Module (Running PS 5.1 Modules in PS 7)

Some modules (ActiveDirectory, GroupPolicy, ADFS, PrintManagement) require the compatibility shim:

```powershell
Import-Module -Name ActiveDirectory -UseWindowsPowerShell  # Built-in PS 7.0+ shim
```

## Registry Operations (Windows-Only)

```powershell
Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' -Name 'ProductName'
Set-ItemProperty -Path 'HKCU:\SOFTWARE\MyApp' -Name 'Setting1' -Value 'enabled'
New-Item -Path 'HKCU:\SOFTWARE\MyApp' -Force                          # Create key
New-ItemProperty -Path 'HKCU:\SOFTWARE\MyApp' -Name 'Count' -Value 42 -PropertyType DWord
Remove-Item -Path 'HKCU:\SOFTWARE\MyApp' -Recurse -Force              # Remove key + subkeys
Test-Path -Path 'HKLM:\SOFTWARE\MyApp'                                # Check existence
```

## Common Mistakes

### Mistake 1: Using Get-EventLog in PowerShell 7

```powershell
# WRONG — removed in PowerShell 7
Get-EventLog -LogName System -Newest 10
# ERROR: CommandNotFoundException

# CORRECT
Get-WinEvent -LogName System -MaxEvents 10
```

### Mistake 2: Assuming Windows Cmdlets Work on Linux

```powershell
# WRONG — no guard, crashes on Linux
$fw = Get-NetFirewallRule -Direction Inbound

# CORRECT
if ($IsWindows) {
    $fw = Get-NetFirewallRule -Direction Inbound
} else {
    # Use iptables/nftables on Linux
    Write-Warning "Firewall cmdlets are Windows-only"
}
```

### Mistake 3: Using -EntryType with Get-WinEvent

```powershell
# WRONG — -EntryType was a Get-EventLog parameter
Get-WinEvent -LogName System -EntryType Error
# ERROR: parameter not found

# CORRECT — use FilterHashtable with Level
# Level values: 1=Critical, 2=Error, 3=Warning, 4=Informational, 5=Verbose
Get-WinEvent -FilterHashtable @{ LogName = 'System'; Level = 2 }
```

### Mistake 4: Slow Event Log Queries

```powershell
# SLOW — retrieves ALL events then filters in PowerShell pipeline
Get-WinEvent -LogName 'Security' | Where-Object { $_.Id -eq 4625 -and $_.TimeCreated -gt (Get-Date).AddDays(-1) }

# FAST — filters server-side with FilterHashtable
Get-WinEvent -FilterHashtable @{
    LogName   = 'Security'
    ID        = 4625
    StartTime = (Get-Date).AddDays(-1)
}
```

### Mistake 5: Confusing Get-WindowsFeature with Get-WindowsOptionalFeature

```powershell
# WRONG on Windows 10/11 client — Get-WindowsFeature is Server only
Get-WindowsFeature -Name 'Hyper-V'
# ERROR: command not found (not a Server OS)

# CORRECT on Windows client
Get-WindowsOptionalFeature -Online -FeatureName 'Microsoft-Hyper-V-All'

# Get-WindowsFeature = Windows Server only (ServerManager module)
# Get-WindowsOptionalFeature = Windows client and server (DISM module)
```

### Mistake 6: Forgetting -Force on Stop-Service with Dependencies

```powershell
# FAILS if the service has dependent services running
Stop-Service -Name 'LanmanServer'
# ERROR: Cannot stop service because dependent services are running

# CORRECT — force stops dependent services too
Stop-Service -Name 'LanmanServer' -Force
```

### Mistake 7: Using Test-Connection for TCP Port Checks

```powershell
# WRONG — Test-Connection only does ICMP ping, not TCP
Test-Connection -TargetName 'server01' -TcpPort 443
# ERROR: parameter not found

# CORRECT — Test-NetConnection does TCP (Windows only)
Test-NetConnection -ComputerName 'server01' -Port 443

# On PS 7.5, Test-Connection DOES NOT have -TcpPort.
# Test-NetConnection is the Windows-only TCP test tool.
```

### Mistake 8: Not Handling the FilterHashtable Syntax Correctly

```powershell
# WRONG — LogName and Level are not strings in the hashtable context
Get-WinEvent -FilterHashtable @{ LogName = System; Level = Error }
# Level expects an integer, not a string like 'Error'

# CORRECT
Get-WinEvent -FilterHashtable @{ LogName = 'System'; Level = 2 }
# Level: 1=Critical, 2=Error, 3=Warning, 4=Informational, 5=Verbose
```

### Mistake 9: Assuming Import-Module ActiveDirectory Works in PS 7

```powershell
# WRONG — may fail without compatibility layer
Import-Module ActiveDirectory
# Can fail with: module was designed for Windows PowerShell 5.1

# CORRECT — use the compatibility shim
Import-Module ActiveDirectory -UseWindowsPowerShell

# Or install the updated RSAT module that supports PS 7 natively
# (available via Windows Settings > Optional Features > RSAT)
```

### Mistake 10: Creating Scheduled Tasks Without All Components

```powershell
# WRONG — missing trigger or action
Register-ScheduledTask -TaskName 'Test' -Action (New-ScheduledTaskAction -Execute 'notepad.exe')
# Registers but never runs — no trigger!

# CORRECT — always include action AND trigger
$action = New-ScheduledTaskAction -Execute 'pwsh.exe' -Argument '-File C:\Scripts\task.ps1'
$trigger = New-ScheduledTaskTrigger -Daily -At '2:00 AM'
Register-ScheduledTask -TaskName 'Test' -Action $action -Trigger $trigger
```
