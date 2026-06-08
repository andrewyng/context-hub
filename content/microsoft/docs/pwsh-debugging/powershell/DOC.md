---
name: pwsh-debugging
description: "PowerShell 7.5 debugging — breakpoints, step debugging, trace logging, Wait-Debugger, and remote debugging"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,debugging,breakpoints,trace,wait-debugger,step"
---

# PowerShell 7.5 Debugging

## Golden Rule

**`Wait-Debugger` is the most useful debugging tool in PowerShell 7.** Drop it anywhere in your code to pause execution at that exact point. It works in scripts, modules, remote sessions, jobs, and containers. When execution hits `Wait-Debugger`, it halts and waits for a debugger to attach.

```powershell
function Process-Data {
    param([string]$Path)
    $data = Get-Content $Path
    Wait-Debugger   # Execution pauses here — attach debugger to inspect $data
    $data | ConvertFrom-Json | ForEach-Object { ... }
}
```

## Breakpoints

### Set-PSBreakpoint

PowerShell supports three types of breakpoints: line, command, and variable.

#### Line Breakpoints

```powershell
# Break at a specific line in a script
Set-PSBreakpoint -Script 'C:\Scripts\Deploy.ps1' -Line 25

# Break at multiple lines
Set-PSBreakpoint -Script 'C:\Scripts\Deploy.ps1' -Line 25, 40, 55

# Break at a line with a condition (only breaks when condition is true)
Set-PSBreakpoint -Script 'C:\Scripts\Deploy.ps1' -Line 25 -Action {
    if ($count -gt 100) { break }
}
```

#### Command Breakpoints

```powershell
# Break whenever a specific command is called
Set-PSBreakpoint -Command 'Get-Service'

# Break on a command within a specific script
Set-PSBreakpoint -Script 'C:\Scripts\Deploy.ps1' -Command 'Invoke-RestMethod'

# Break with action (log without stopping)
Set-PSBreakpoint -Command 'Remove-Item' -Action {
    Write-Warning "Remove-Item called with: $($args[0])"
    continue   # Don't actually break — just log and continue
}
```

#### Variable Breakpoints

```powershell
# Break when a variable is written to
Set-PSBreakpoint -Variable 'count' -Mode Write

# Break when a variable is read
Set-PSBreakpoint -Variable 'config' -Mode Read

# Break on both read and write
Set-PSBreakpoint -Variable 'data' -Mode ReadWrite

# Break on variable in a specific script
Set-PSBreakpoint -Script 'C:\Scripts\Deploy.ps1' -Variable 'result' -Mode Write
```

### Managing Breakpoints

```powershell
# List all breakpoints
Get-PSBreakpoint

# List breakpoints by type
Get-PSBreakpoint -Type Line
Get-PSBreakpoint -Type Command
Get-PSBreakpoint -Type Variable

# Disable a breakpoint (keeps it, but stops it from triggering)
Disable-PSBreakpoint -Id 0

# Enable a disabled breakpoint
Enable-PSBreakpoint -Id 0

# Remove a specific breakpoint
Remove-PSBreakpoint -Id 0

# Remove all breakpoints
Get-PSBreakpoint | Remove-PSBreakpoint
```

## Step Debugging (Interactive Debugger)

When execution hits a breakpoint or `Wait-Debugger`, you enter the interactive debugger. The prompt changes to `[DBG]:`.

### Debugger Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `stepInto` | `s` | Execute next statement, stepping INTO functions |
| `stepOver` | `v` | Execute next statement, stepping OVER functions |
| `stepOut` | `o` | Run to end of current function, then break |
| `continue` | `c` | Continue execution until next breakpoint |
| `quit` | `q` | Stop execution and exit debugger |
| `list` | `l` | Show source code around current line |
| `list <n>` | `l <n>` | Show source code around line n |
| `<expression>` | | Evaluate any PowerShell expression |

At the `[DBG]:` prompt you can evaluate any PowerShell expression, inspect variables, and use the step commands above. Key distinction: `s` (stepInto) enters called functions, `v` (stepOver) executes them entirely, `o` (stepOut) runs to end of current function.

## Wait-Debugger (Remote and Container Debugging)

### How Wait-Debugger Works

`Wait-Debugger` pauses the current runspace and waits for a debugger to attach. This is essential for debugging code that runs in contexts you cannot directly interact with: jobs, remote sessions, containers, scheduled tasks.

```powershell
# In your script (e.g., running inside a container or job)
$data = Get-Content '/app/config.json' | ConvertFrom-Json
Wait-Debugger   # Script pauses here until debugger attaches
$data.settings | ForEach-Object { ... }
```

### Attaching to a Paused Runspace

```powershell
# Step 1: Find the process and runspace
Enter-PSHostProcess -Id <PID>
# or
Enter-PSHostProcess -Name 'pwsh'

# Step 2: List runspaces (find the one paused at Wait-Debugger)
Get-Runspace
# Look for: Availability = InBreakpoint

# Step 3: Attach debugger to that runspace
Debug-Runspace -Id <RunspaceId>

# Now you're in the debugger at the Wait-Debugger line
# Use s, v, o, c, q as normal

# Step 4: When done, exit
q        # Quit debugger
exit     # Exit the host process
```

### Debugging a Background Job

```powershell
# Start a job with Wait-Debugger in the script
$job = Start-Job -ScriptBlock {
    $items = Get-ChildItem /tmp
    Wait-Debugger   # Job pauses here
    $items | Where-Object Length -gt 1MB
}

# Attach to the job
Debug-Job -Job $job

# You're now in the debugger inside the job's runspace
[DBG]: PS>> $items.Count
42
[DBG]: PS>> c    # Continue the job
```

### Debugging in Remote Sessions

Same pattern: script with `Wait-Debugger` runs via `Invoke-Command -Session $session`. In another terminal, `Enter-PSSession -Session $session`, then `Get-Runspace` and `Debug-Runspace -Id <id>`.

## Set-PSDebug (Trace and Strict Mode)

### Trace Levels

```powershell
# Trace level 0: Off (default)
Set-PSDebug -Trace 0

# Trace level 1: Show each line as it executes
Set-PSDebug -Trace 1
# Output:
# DEBUG:    1+  $x = 5
# DEBUG:    2+  $y = $x * 2
# DEBUG:    3+  Write-Output $y

# Trace level 2: Show lines, variable assignments, and function calls
Set-PSDebug -Trace 2
# Output:
# DEBUG:    1+  $x = 5
# DEBUG:     ! SET $x = '5'.
# DEBUG:    2+  $y = $x * 2
# DEBUG:     ! SET $y = '10'.
# DEBUG:    3+  Write-Output $y
# DEBUG:     ! CALL function 'Write-Output'

# Turn off tracing
Set-PSDebug -Off
```

### Other Set-PSDebug Modes

- `Set-PSDebug -Step` — prompts before every statement (interactive)
- `Set-PSDebug -Strict` — errors on uninitialized variables (prefer `Set-StrictMode -Version Latest` for more comprehensive checks)
- `Set-PSDebug -Off` — fully resets all debug modes

## Trace-Command (Parameter Binding Diagnostics)

`Trace-Command` is invaluable for understanding why PowerShell binds parameters the way it does.

```powershell
# Trace parameter binding for a command
Trace-Command -Name ParameterBinding -Expression {
    Get-ChildItem -Path /tmp -Filter '*.log'
} -PSHost

# Output shows exactly how PowerShell resolves parameters:
# BIND NAMED cmd line args [Get-ChildItem]
#     BIND arg [/tmp] to parameter [Path]
#     BIND arg [*.log] to parameter [Filter]
# ...

# Trace multiple sources
Trace-Command -Name ParameterBinding, TypeConversion -Expression {
    [int]"42"
} -PSHost

# Common trace sources:
# ParameterBinding — how parameters are bound to arguments
# TypeConversion   — how types are converted
# FormatViewBinding — how Format-* cmdlets choose views
# CommandDiscovery — how commands are found

# List all available trace sources
Get-TraceSource
```


## Debug Preference and Write-Debug

`$DebugPreference` controls `Write-Debug` visibility: `SilentlyContinue` (default/hidden), `Continue` (show), `Inquire` (show + confirm), `Stop` (throw).

Use `Write-Debug` in `[CmdletBinding()]` functions — callers enable with `-Debug` switch:

```powershell
function Invoke-Deploy {
    [CmdletBinding()]   # Required for -Debug switch to work
    param([string]$Server, [string]$Package)
    Write-Debug "Starting deployment to $Server"
    # ... logic ...
}
Invoke-Deploy -Server 'Web01' -Package 'app.zip' -Debug  # Shows debug messages
```

## Debugging in VS Code

VS Code with the PowerShell extension provides full GUI debugging. Key shortcuts:

| Shortcut | Action | Shortcut | Action |
|----------|--------|----------|--------|
| **F5** | Start/Continue | **F9** | Toggle breakpoint |
| **F10** | Step Over | **F11** | Step Into |
| **Shift+F11** | Step Out | **Shift+F5** | Stop debugging |

Right-click gutter for **Conditional Breakpoints**: expression (`$count -gt 100`), hit count, or log message (logpoint).

See VS Code PowerShell extension docs for `launch.json` configuration.

## Transcript Logging

```powershell
# Record all console I/O; use -Append to add to existing file
Start-Transcript -Path "C:\Logs\debug-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
# ... run commands ...
Stop-Transcript

# In scripts — wrap in try/finally to always stop
Start-Transcript -Path (Join-Path $PSScriptRoot "logs\$(Get-Date -Format 'yyyyMMdd-HHmmss').txt")
try { <# script logic #> } finally { Stop-Transcript }
```

## Verbose Output

Use `Write-Verbose` in `[CmdletBinding()]` functions. Callers enable with `-Verbose` switch or `$VerbosePreference = 'Continue'` globally.

## Common Mistakes

### Mistake 1: Forgetting [CmdletBinding()] for -Debug and -Verbose

```powershell
# WRONG — simple function, -Debug switch doesn't exist
function Get-Data {
    param([string]$Name)
    Write-Debug "Processing $Name"   # This is NEVER visible
}
Get-Data -Name 'test' -Debug
# ERROR: parameter -Debug not found

# CORRECT — add [CmdletBinding()] to enable common parameters
function Get-Data {
    [CmdletBinding()]
    param([string]$Name)
    Write-Debug "Processing $Name"
}
Get-Data -Name 'test' -Debug
# DEBUG: Processing test
```

### Mistake 2: Using Write-Host for Debugging

```powershell
# BAD PRACTICE — Write-Host cannot be suppressed or redirected
function Process-Items {
    param([array]$Items)
    Write-Host "Item count: $($Items.Count)"   # Always visible, clutters output
    Write-Host "Processing..."
}

# CORRECT — use Write-Debug or Write-Verbose
function Process-Items {
    [CmdletBinding()]
    param([array]$Items)
    Write-Debug "Item count: $($Items.Count)"    # Only with -Debug
    Write-Verbose "Processing..."                 # Only with -Verbose
}
```

### Mistake 3: Leaving Wait-Debugger in Production Code

```powershell
# WRONG — forgot to remove Wait-Debugger before deploying
function Deploy-App {
    $config = Get-Config
    Wait-Debugger   # Script hangs forever in production!
    Start-Deploy $config
}

# CORRECT — remove Wait-Debugger, or gate it with a flag
function Deploy-App {
    $config = Get-Config
    if ($env:POWERSHELL_DEBUG) { Wait-Debugger }   # Only in debug mode
    Start-Deploy $config
}
```

### Mistake 4: Not Using -Off to Disable Set-PSDebug

Use `Set-PSDebug -Off` to fully reset (not `-Trace 0`, which doesn't disable Step mode).

### Mistake 5: Confusing Set-StrictMode with Set-PSDebug -Strict

`Set-PSDebug -Strict` only catches uninitialized variables. Prefer `Set-StrictMode -Version Latest` which also catches non-existent properties, wrong function call syntax, and out-of-bounds array access.

### Mistake 6: Breakpoints Not Working

- If breakpoints don't hit: use `pwsh -File script.ps1` (not `-Command`)
- For module-private functions: use `-Script` with the file path, not `-Command`

### Mistake 7: Not Using Trace-Command for Parameter Binding Issues

Use `Trace-Command -Name ParameterBinding -Expression { <cmd> } -PSHost` to diagnose "cannot bind parameter" errors instead of guessing.

### Mistake 8: Forgetting Enter-PSHostProcess for Container Debugging

You must `Enter-PSHostProcess -Id <PID>` first, then `Get-Runspace` and `Debug-Runspace`. You cannot call `Debug-Runspace` directly from outside the host process.

### Mistake 9: Write-Debug Stream Redirection

`Write-Debug` goes to stream 5. To capture: `5>&1` (merge to output), `5> debug.log` (to file), `*>&1` (all streams). Piping without redirect only searches stream 1.
