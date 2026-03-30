---
name: pwsh-remoting
description: "PowerShell 7.5 remoting — Invoke-Command, PSSession, SSH remoting, WinRM, $using: scope, and serialization constraints"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,remoting,invoke-command,pssession,ssh,winrm,using"
---

# PowerShell 7.5 Remoting

## Golden Rule

**Remote objects are deserialized snapshots.** Objects crossing a remoting boundary are serialized to CLIXML and deserialized on the other side. The result is a property bag — **all methods are gone**, only properties survive. The type gains a `Deserialized.` prefix (e.g., `Deserialized.System.Diagnostics.Process`).

```powershell
# WRONG — method does not exist on deserialized object
$svc = Invoke-Command -HostName server1 -ScriptBlock { Get-Service wuauserv }
$svc.Stop()  # ERROR: Method invocation failed

# RIGHT — execute the action remotely
Invoke-Command -HostName server1 -ScriptBlock { Stop-Service wuauserv }
```

## Invoke-Command Fundamentals

```powershell
# WinRM transport (-ComputerName)
Invoke-Command -ComputerName server1 -ScriptBlock { Get-Process | Where-Object CPU -gt 100 }

# SSH transport (-HostName) — PS7+ cross-platform, preferred
Invoke-Command -HostName server1 -ScriptBlock { Get-Process | Where-Object CPU -gt 100 }
```

`-ComputerName` = WinRM (port 5985/5986). `-HostName` = SSH (port 22). **Mutually exclusive.**

### Passing Arguments

```powershell
# -ArgumentList (positional)
Invoke-Command -HostName server1 -ScriptBlock {
    param($Name, $Threshold)
    Get-Process -Name $Name | Where-Object CPU -gt $Threshold
} -ArgumentList 'pwsh', 50

# $using: (preferred — cleaner, captures local variables)
$processName = 'pwsh'
$threshold = 50
Invoke-Command -HostName server1 -ScriptBlock {
    Get-Process -Name $using:processName | Where-Object CPU -gt $using:threshold
}
```

### Fan-Out and Throttling

```powershell
$servers = 'web01', 'web02', 'web03', 'db01'

# Runs CONCURRENTLY on all machines (default ThrottleLimit = 32)
Invoke-Command -HostName $servers -ScriptBlock {
    [PSCustomObject]@{ Host = $env:COMPUTERNAME; Uptime = (Get-Uptime).TotalHours }
}

# Limit concurrency
Invoke-Command -HostName $servers -ThrottleLimit 5 -ScriptBlock { }
```

Results include `PSComputerName` so you know which host returned what.

### Credentials

```powershell
# WinRM — PSCredential supported
Invoke-Command -ComputerName server1 -Credential (Get-Credential) -ScriptBlock { whoami }

# SSH — NO PSCredential support; use -UserName + -KeyFilePath
Invoke-Command -HostName server1 -UserName admin -KeyFilePath ~/.ssh/id_ed25519 -ScriptBlock { whoami }
```

## SSH Remoting (PS7+)

Requires the `powershell` subsystem in `sshd_config`:
```
Subsystem powershell /usr/bin/pwsh -sshs -NoLogo -NoProfile
```

| Parameter | Purpose |
|-----------|---------|
| `-HostName` | Target host (triggers SSH) |
| `-UserName` | SSH username |
| `-KeyFilePath` | Private key path |
| `-Port` | SSH port (default 22) |
| `-Options` | Raw SSH options hashtable (PS 7.3+) |

## WinRM Remoting

| Aspect | WinRM | SSH |
|--------|-------|-----|
| Transport | HTTP/S (5985/5986) | SSH (22) |
| Auth | Kerberos, NTLM, CredSSP | Keys, password |
| Cross-platform | Windows only | All platforms |
| Parameter | `-ComputerName` | `-HostName` |
| Setup | `Enable-PSRemoting` | sshd + subsystem |

For non-domain WinRM: `Set-Item WSMan:\localhost\Client\TrustedHosts -Value 'server1'`

## PSSessions (Persistent Sessions)

Sessions maintain state — variables, functions, and modules persist between calls.

```powershell
$s = New-PSSession -HostName server1
Invoke-Command -Session $s -ScriptBlock { $counter = 0 }
Invoke-Command -Session $s -ScriptBlock { $counter++; $counter }  # Returns 1

# Reuse sessions across multiple hosts for performance
$sessions = New-PSSession -HostName web01, web02, web03
Invoke-Command -Session $sessions -ScriptBlock { Get-Service nginx }
$sessions | Remove-PSSession

# Interactive (prompt-only, NOT for scripts)
Enter-PSSession -Session $s
Exit-PSSession
Remove-PSSession $s
```

**Disconnected sessions** (WinRM only, not SSH):
```powershell
$s = New-PSSession -ComputerName server1
Disconnect-PSSession $s
# Later: Get-PSSession -ComputerName server1 | Connect-PSSession
```

## Implicit Remoting

Proxy remote commands locally via `Import-PSSession`:

```powershell
$s = New-PSSession -HostName exchange-server
Import-PSSession -Session $s -Module ExchangeOnlineManagement -Prefix Remote
Get-RemoteMailbox -Identity user@domain.com  # Runs on remote, looks local
# Session must stay open. Same deserialization rules apply.
```

## Serialization Details

Default depth is **2**. Nested objects beyond that become `.ToString()` strings.

**Types that survive:** `[string]`, `[int]`, `[long]`, `[double]`, `[decimal]`, `[bool]`, `[DateTime]`, `[TimeSpan]`, `[Guid]`, `[Uri]`, `[Version]`, `[byte[]]`, `[PSCustomObject]`, `[hashtable]`, `[array]` (becomes `[object[]]`).

**Types that do NOT survive:** Any .NET object with methods (becomes `Deserialized.*`), `[ScriptBlock]`, `[SecureString]` (only WinRM+CredSSP), file handles, connections.

```powershell
$remote_proc = Invoke-Command -HostName server1 -ScriptBlock { Get-Process pwsh }
$remote_proc.GetType().FullName  # System.Management.Automation.PSObject (NOT Process)
```

## -AsJob with Invoke-Command

```powershell
$job = Invoke-Command -HostName server1, server2 -ScriptBlock { Start-Sleep 30; Get-Process } -AsJob
$job.ChildJobs | Format-Table State, Location  # Per-host child jobs
$results = Receive-Job $job -Wait
Remove-Job $job
```

## Common Mistakes LLMs Make

### Mistake 1: Forgetting $using: in Remote ScriptBlocks
```powershell
# WRONG — $name is $null on the remote side
$name = 'nginx'
Invoke-Command -HostName server1 -ScriptBlock { Get-Service $name }
# RIGHT
Invoke-Command -HostName server1 -ScriptBlock { Get-Service $using:name }
```
Local variables do NOT exist in the remote scope without `$using:`.

### Mistake 2: Mixing -ComputerName and -HostName Parameters
```powershell
# WRONG — -ComputerName is WinRM, -KeyFilePath is SSH-only
Invoke-Command -ComputerName server1 -KeyFilePath ~/.ssh/id_ed25519 -ScriptBlock { }
# RIGHT
Invoke-Command -HostName server1 -KeyFilePath ~/.ssh/id_ed25519 -ScriptBlock { }
```

### Mistake 3: Calling Methods on Deserialized Objects
```powershell
# WRONG
$proc = Invoke-Command -HostName server1 -ScriptBlock { Get-Process -Id 1234 }
$proc.Kill()  # Method does not exist
# RIGHT
Invoke-Command -HostName server1 -ScriptBlock { Stop-Process -Id 1234 -Force }
```

### Mistake 4: Passing ScriptBlocks to Remote Sessions
```powershell
# WRONG — [ScriptBlock] cannot cross remoting boundaries
$filter = { $_.CPU -gt 100 }
Invoke-Command -HostName server1 -ScriptBlock { Get-Process | Where-Object $using:filter }
# RIGHT — inline the logic
Invoke-Command -HostName server1 -ScriptBlock { Get-Process | Where-Object CPU -gt 100 }
```

### Mistake 5: Using -Credential with SSH Remoting
```powershell
# WRONG — SSH does not accept PSCredential
Invoke-Command -HostName server1 -Credential $cred -ScriptBlock { whoami }
# RIGHT
Invoke-Command -HostName server1 -UserName admin -KeyFilePath ~/.ssh/id_ed25519 -ScriptBlock { whoami }
```

### Mistake 6: Assuming Fan-Out Is Sequential
```powershell
# Runs on ALL hosts CONCURRENTLY — not one at a time
Invoke-Command -HostName server1, server2, server3 -ScriptBlock { Restart-Service nginx }
# For sequential: use a foreach loop
```

### Mistake 7: Using Disconnect-PSSession with SSH
```powershell
# WRONG — Disconnect/Connect-PSSession only works with WinRM
$s = New-PSSession -HostName linux-box
Disconnect-PSSession $s  # ERROR
```

### Mistake 8: Not Flattening Objects for Serialization
```powershell
# WRONG — nested objects beyond depth 2 lose structure
$r = Invoke-Command -HostName s1 -ScriptBlock { Get-ChildItem -Recurse | Select-Object * }
# RIGHT — flatten on the remote side
$r = Invoke-Command -HostName s1 -ScriptBlock {
    Get-ChildItem -Recurse | ForEach-Object {
        [PSCustomObject]@{ FullName = $_.FullName; Length = $_.Length }
    }
}
```

### Mistake 9: Leaking PSSessions
```powershell
# WRONG — session leak
foreach ($server in $servers) {
    $s = New-PSSession -HostName $server
    Invoke-Command -Session $s -ScriptBlock { Get-Service }  # Never removed!
}
# RIGHT
$sessions = New-PSSession -HostName $servers
try { Invoke-Command -Session $sessions -ScriptBlock { Get-Service } }
finally { $sessions | Remove-PSSession }
```

### Mistake 10: Using Enter-PSSession in Scripts
```powershell
# WRONG — Enter-PSSession is interactive-only
Enter-PSSession -HostName server1
Get-Service nginx  # Runs LOCALLY, not on server1!
Exit-PSSession
# RIGHT — use Invoke-Command in scripts
Invoke-Command -HostName server1 -ScriptBlock { Get-Service nginx }
```

## Quick Reference

| Task | Command |
|------|---------|
| Remote command (SSH) | `Invoke-Command -HostName host -ScriptBlock { ... }` |
| Remote command (WinRM) | `Invoke-Command -ComputerName host -ScriptBlock { ... }` |
| Persistent session | `New-PSSession -HostName host` |
| Interactive session | `Enter-PSSession -HostName host` |
| Import remote cmds | `Import-PSSession -Session $s -Module Mod` |
| Fan-out | `Invoke-Command -HostName h1,h2,h3 -ScriptBlock { ... }` |
| Background job | `Invoke-Command -HostName host -ScriptBlock { ... } -AsJob` |
| Pass local variable | `$using:varName` inside ScriptBlock |
| Limit concurrency | `-ThrottleLimit 5` |
