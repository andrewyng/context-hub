---
name: pwsh-error-handling
description: "PowerShell 7.5 error handling — ErrorAction, try/catch/finally, terminating vs non-terminating errors, $LASTEXITCODE, error records"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,error-handling,try-catch,erroraction,exceptions"
---

# PowerShell 7.5 Error Handling

## Golden Rule

PowerShell has **two kinds of errors**: terminating and non-terminating.

> **`try/catch` ONLY catches terminating errors.** Non-terminating errors flow right through a `try` block. Use `-ErrorAction Stop` to promote non-terminating errors to terminating.

```powershell
# BUG: catch NEVER executes — Get-Item writes a non-terminating error
try { Get-Item -Path 'C:\DoesNotExist' }
catch { Write-Host "Caught: $_" }   # Never reached

# FIX: -ErrorAction Stop converts it to terminating
try { Get-Item -Path 'C:\DoesNotExist' -ErrorAction Stop }
catch { Write-Host "Caught: $_" }   # Now executes
```

## Terminating vs Non-Terminating Errors

**Terminating** (caught by `try/catch`): `throw`, `$PSCmdlet.ThrowTerminatingError()`, .NET exceptions like `[int]::Parse("x")`, `-ErrorAction Stop`, `$ErrorActionPreference = 'Stop'`.

**Non-terminating** (NOT caught by `try/catch`): most cmdlet operational errors (`Get-Item 'C:\NoSuchPath'`), `Write-Error`, individual pipeline item failures.

`Write-Error` is **non-terminating**. `throw` is **terminating**. They are not interchangeable:

```powershell
try {
    Write-Error "non-terminating"
    Write-Host "This STILL executes"   # Runs
}
catch { Write-Host "Never reached" }

try {
    throw "terminating"
    Write-Host "Never executes"
}
catch { Write-Host "Caught: $_" }      # Runs
```

## ErrorAction Preference

### -ErrorAction Common Parameter

| Value | Behavior |
|-------|----------|
| `Stop` | Converts non-terminating to terminating. **Use to make errors catchable.** |
| `Continue` | **(Default)** Writes the error, continues execution. |
| `SilentlyContinue` | Suppresses display, still adds to `$Error`. |
| `Ignore` | Suppresses display AND does **not** add to `$Error`. |
| `Break` | Enters the debugger (PowerShell 7+). |

### $ErrorActionPreference Variable

Sets the default for the **current scope**:

```powershell
$ErrorActionPreference = 'Stop'
try { Get-Item 'C:\DoesNotExist' }   # Now terminating without -ErrorAction
catch { Write-Host "Caught: $_" }
```

### Scoping Rules

`$ErrorActionPreference` follows normal PowerShell scoping. Setting it in a child function does NOT affect the caller. Setting it in a parent DOES affect child scopes by inheritance. `-ErrorAction` on a specific call **always overrides** `$ErrorActionPreference`:

```powershell
$ErrorActionPreference = 'Stop'
Get-Item 'C:\Nope' -ErrorAction Continue   # Non-terminating despite preference
```

## try/catch/finally

### Basic Structure

```powershell
try {
    $content = Get-Content -Path $filePath -ErrorAction Stop
}
catch {
    # $_ is the ErrorRecord object (NOT the exception directly)
    Write-Warning "Failed: $($_.Exception.Message)"
}
finally {
    # ALWAYS runs — even when catch re-throws
    if ($connection) { $connection.Close() }
}
```

### Catching Specific Exception Types

```powershell
try { $data = Get-Content 'C:\secret.txt' -ErrorAction Stop }
catch [System.IO.FileNotFoundException] { Write-Warning "Not found" }
catch [System.UnauthorizedAccessException] { Write-Warning "Access denied" }
catch { Write-Warning "Unexpected: $($_.Exception.GetType().FullName)" }
```

Order matters: more specific types first. PowerShell matches top-to-bottom using `is`-a inheritance.

### The ErrorRecord Object ($_ in catch)

| Property | Description |
|----------|-------------|
| `$_.Exception` | The .NET exception object |
| `$_.Exception.Message` | Human-readable error message |
| `$_.Exception.GetType().FullName` | Full .NET type name |
| `$_.Exception.InnerException` | Wrapped inner exception (if any) |
| `$_.InvocationInfo.ScriptLineNumber` | Line number of the error |
| `$_.InvocationInfo.ScriptName` | Script file path |
| `$_.ScriptStackTrace` | PowerShell call stack string |
| `$_.TargetObject` | Object the cmdlet was operating on |
| `$_.FullyQualifiedErrorId` | Machine-readable error identifier |
| `$_.CategoryInfo` | Error category enum |

### Re-Throwing

Bare `throw` re-throws the current error preserving the stack trace. `throw $_` wraps it in a new `RuntimeException`. Always prefer bare `throw`.

## $LASTEXITCODE

| Variable | Set By | Type | Meaning |
|----------|--------|------|---------|
| `$LASTEXITCODE` | Native executables only (git, curl, etc.) | `[int]` | Process exit code (0 = success) |
| `$?` | Both cmdlets and native commands | `[bool]` | `$true` if last command succeeded |

Cmdlets **do not set** `$LASTEXITCODE`. It retains its previous value. This is the #1 mistake:

```powershell
# WRONG: $LASTEXITCODE is stale after a cmdlet
Get-Process -Name 'explorer'
if ($LASTEXITCODE -ne 0) { throw "failed" }   # Checks some PREVIOUS native command

# CORRECT: $? for cmdlets, $LASTEXITCODE for native commands
Get-Process -Name 'explorer'
if (-not $?) { throw "Get-Process failed" }

git clone https://github.com/example/repo.git
if ($LASTEXITCODE -ne 0) { throw "git clone failed: $LASTEXITCODE" }
```

### $PSNativeCommandUseErrorActionPreference (PowerShell 7.3+)

When `$true`, native commands with non-zero exit codes respect `$ErrorActionPreference`:

```powershell
$PSNativeCommandUseErrorActionPreference = $true
$ErrorActionPreference = 'Stop'
try { git clone https://bad-url.invalid/repo.git }
catch { Write-Host "Native command failed: $_" }
```

## $Error Array

```powershell
$Error[0]             # Most recent error
$Error.Count          # Total errors in session
$Error.Clear()        # Clear all
```

Max size: `$MaximumErrorCount` (default 256). `-ErrorAction Ignore` does NOT add to `$Error`; `-ErrorAction SilentlyContinue` does.

## ErrorVariable Parameter

Captures errors into a named variable. The name has **no `$` prefix**:

```powershell
Get-Item 'C:\NoSuchPath' -ErrorAction SilentlyContinue -ErrorVariable myErrors
if ($myErrors) { $myErrors | ForEach-Object { Write-Host $_.Exception.Message } }

# Append with + prefix
Get-Item 'C:\Path1' -ErrorAction SilentlyContinue -ErrorVariable +allErrors
Get-Item 'C:\Path2' -ErrorAction SilentlyContinue -ErrorVariable +allErrors
```

## trap Statement

Legacy scope-based error handler, still valid in 7.5:

```powershell
function Test-Trap {
    trap {
        Write-Host "Trapped: $_"
        continue   # Suppress error, resume at next statement
    }
    throw "Error 1"
    Write-Host "After error 1"   # Executes because trap used 'continue'
}
```

`continue` suppresses and resumes. `break` re-throws to the parent scope. Prefer `try/catch` for targeted handling; `trap` for scope-wide handlers.

## Common Mistakes

### 1. try/catch without -ErrorAction Stop
```powershell
# WRONG                                          # CORRECT
try { Get-ChildItem 'C:\Fake' }                  try { Get-ChildItem 'C:\Fake' -ErrorAction Stop }
catch { "caught" }                                catch { "caught" }
```

### 2. Confusing $LASTEXITCODE with $?
```powershell
# WRONG: $LASTEXITCODE not set by cmdlets        # CORRECT
Remove-Item $path                                 Remove-Item $path
if ($LASTEXITCODE -ne 0) { throw "failed" }      if (-not $?) { throw "failed" }
```

### 3. Catching the Wrong Exception Type
Cmdlets often wrap exceptions. Always check `$_.Exception.GetType().FullName` first before adding typed catches.

### 4. Write-Error Expecting It to Be Caught
`Write-Error` is non-terminating. Use `throw` or `$PSCmdlet.ThrowTerminatingError()` for catchable errors.

### 5. $ErrorActionPreference Not Scoped
Setting it in a child function does not affect the caller. Set it in the scope where you need it.

### 6. throw $_ Instead of Bare throw
`throw $_` wraps in a new `RuntimeException`, losing the original stack. Use bare `throw`.

### 7. -ErrorAction on throw
`throw` is a keyword, not a cmdlet. `throw "error" -ErrorAction SilentlyContinue` is a syntax error.

### 8. Checking $? After Multiple Statements
`$?` reflects only the **last** command. Check it immediately after the command you care about.

### 9. Assuming All Errors Appear in $Error
`-ErrorAction Ignore` does NOT add to `$Error`. `-ErrorAction SilentlyContinue` does.

### 10. Forgetting finally Runs Even on Re-Throw
`finally` ALWAYS runs, even when `catch` re-throws. This is by design for cleanup.
