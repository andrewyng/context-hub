---
name: pwsh-core
description: "PowerShell 7.5 core language fundamentals — types, operators, variables, scoping, automatic variables, and execution model"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,core,types,operators,variables,scoping,execution"
---

# PowerShell 7.5 Core Language Fundamentals

You are a **PowerShell 7.5 expert**. This guide covers core language features LLMs most frequently get wrong.

> Ground truth: Microsoft PowerShell documentation on learn.microsoft.com.

## Golden Rule: PowerShell Is Object-Oriented, Not Text-Oriented

**PowerShell passes .NET objects through the pipeline, not strings.** Every command emits objects with typed properties and methods. Never parse text when you can access object properties directly.

```powershell
# WRONG (bash thinking):
Get-Process | grep "chrome"
# CORRECT (object pipeline):
Get-Process | Where-Object ProcessName -eq 'chrome'
# Objects have typed properties:
(Get-Process -Name chrome).WorkingSet64   # Returns [long], not a string
```

## Type System

### Type Accelerators

| Accelerator | .NET Type | Accelerator | .NET Type |
|---|---|---|---|
| `[string]` | System.String | `[int]` | System.Int32 |
| `[long]` | System.Int64 | `[double]` | System.Double |
| `[decimal]` | System.Decimal | `[bool]` | System.Boolean |
| `[datetime]` | System.DateTime | `[array]` | System.Object[] |
| `[hashtable]` | System.Collections.Hashtable | `[pscustomobject]` | PSCustomObject |
| `[xml]` | System.Xml.XmlDocument | `[regex]` | System.Text.RegularExpressions.Regex |
| `[ipaddress]` | System.Net.IPAddress | `[uri]` | System.Uri |
| `[guid]` | System.Guid | `[scriptblock]` | ScriptBlock |
| `[type]` | System.Type | `[void]` | System.Void |

### Casting and Constrained Variables

```powershell
[int]'42'              # String to int: 42
[datetime]'2026-03-30' # String to DateTime
[int]$port = 8080      # Constrained — rejects invalid types after declaration
$port = 'hello'        # ERROR: Cannot convert "hello" to System.Int32
[array]$result = Get-Item C:\Windows  # Always an array, even if 1 item
```

### CRITICAL: $null Comparison Order

Always put `$null` on the LEFT side. When a collection is on the left of `-eq`, PowerShell filters the array instead of checking for null:

```powershell
# WRONG — filters array, does not check for null:
if ($values -eq $null) { 'is null' }
# CORRECT — scalar comparison:
if ($null -eq $values) { 'is null' }
if ($null -ne $result) { 'has value' }
```

## Variables and Scoping

### Scope Modifiers

| Modifier | Description |
|---|---|
| `$local:var` | Current scope only (default for new variables) |
| `$script:var` | Visible to entire .ps1 file |
| `$global:var` | Visible to entire session |
| `$private:var` | Current scope, invisible to child scopes |
| `$using:var` | Pass local variable into remote/parallel scope |

**Key rule**: Child scopes READ parent variables, but WRITING creates a local copy unless you use a scope modifier.

```powershell
$script:counter = 0
function Increment { $script:counter++ }

# $using: is REQUIRED for remoting and ForEach-Object -Parallel:
$threshold = 100
Invoke-Command -ComputerName Server1 -ScriptBlock {
    Get-Process | Where-Object { $_.WorkingSet64 -gt $using:threshold }
}
$prefix = 'LOG'
1..10 | ForEach-Object -Parallel { "$($using:prefix): Processing $_" }
```

## Operators

### Comparison Operators (Case-INSENSITIVE by Default)

Prefix with `c` for case-sensitive (`-ceq`, `-clike`, `-cmatch`):

| Operator | Meaning | Example |
|---|---|---|
| `-eq` / `-ne` | Equal / Not equal | `'abc' -eq 'ABC'` is `$true` |
| `-gt` / `-lt` | Greater / Less than | `5 -gt 3` is `$true` |
| `-ge` / `-le` | Greater-or-equal / Less-or-equal | `5 -ge 5` is `$true` |
| `-like` / `-notlike` | Wildcard match | `'hello' -like 'h*'` is `$true` |
| `-match` / `-notmatch` | Regex match (populates `$Matches`) | `'abc123' -match '\d+'` |
| `-contains` / `-notcontains` | Collection contains value | `@(1,2,3) -contains 2` |
| `-in` / `-notin` | Value in collection | `2 -in @(1,2,3)` |

**`-contains`/`-in` test exact collection membership, NOT substrings.** `-match` populates `$Matches`:

```powershell
if ('Server-DC01' -match 'Server-(\w+)') { $Matches[1] }  # 'DC01'
```

### Logical Operators

`-and`, `-or`, `-not` (alias `!`), `-xor` — all short-circuit except `-xor`.

### PowerShell 7+ Operators

```powershell
# Chain operators (based on $?):
Get-Process -Name notepad && Stop-Process -Name notepad
Get-Process -Name notepad || Write-Host 'Not running'
# Ternary:
$status = $count -gt 0 ? 'has items' : 'empty'
# Null-coalescing:
$value = $userInput ?? 'default'
$config ??= Get-DefaultConfig
# Null-conditional (MUST use ${} braces):
${obj}?.Property       # Returns $null if $obj is $null
${arr}?[0]             # Returns $null if $arr is $null
$obj?.Property         # WRONG — parsed as variable named "obj?"
```

### String Operators

```powershell
'hello' -replace 'l+', 'L'     # Regex replacement: 'heLo'
'a,b,c' -split ','              # Split: @('a','b','c')
@('a','b','c') -join ','        # Join: 'a,b,c'
# WARNING: -replace uses regex. Escape special chars:
'file.txt' -replace '\.', '_'   # 'file_txt' (escaped dot)
'file.txt' -replace '.', '_'    # '________' (unescaped = match any)
```

## Automatic Variables

| Variable | Description |
|---|---|
| `$_` / `$PSItem` | Current pipeline object (process block / ForEach / Where) |
| `$?` | `$true` if last PowerShell command succeeded |
| `$LASTEXITCODE` | Exit code of last native/external program |
| `$Error` | All errors in session (newest first) |
| `$null`, `$true`, `$false` | Null and boolean literals |
| `$PSVersionTable` | PowerShell version info |
| `$PSScriptRoot` | Directory containing the executing script (empty at prompt) |
| `$PSCommandPath` | Full path of executing script |
| `$IsLinux`, `$IsWindows`, `$IsMacOS` | Platform detection booleans |
| `$HOME`, `$PROFILE`, `$PWD` | Home dir, profile path, working directory |
| `$args` | Unbound arguments to script/function |
| `$input` | Pipeline input enumerator (in end block or scripts) |
| `$Matches` | Populated by `-match` with capture groups |

### $? vs $LASTEXITCODE

```powershell
# $? reflects the last POWERSHELL command:
Get-Item 'C:\nonexistent'    # $? is $false
# $LASTEXITCODE reflects the last NATIVE program exit code:
git status                   # $LASTEXITCODE is 0
# TRAP: $? is reset by EVERY statement:
git checkout nonexistent-branch
Write-Host 'checking...'    # Resets $? to $true — no longer reflects git
$?                           # $true (reflects Write-Host, not git!)
```

## Execution Precedence

Alias > Function > Cmdlet > External Application.

```powershell
# A function named 'ping' shadows ping.exe:
function ping { Write-Host 'Custom' }
ping          # Runs function, NOT ping.exe
# Bypass with call operator or module-qualified name:
& (Get-Command ping.exe).Source 8.8.8.8
Microsoft.PowerShell.Management\Get-ChildItem
```

## Common Mistakes

### 1. Using `==` instead of `-eq`
```powershell
if ($name == 'admin') { }   # WRONG — not valid PowerShell
if ($name -eq 'admin') { }  # CORRECT
```

### 2. Forgetting `-eq` is case-insensitive
```powershell
'Hello' -eq 'hello'    # $true (surprise!)
'Hello' -ceq 'hello'   # $false (case-sensitive)
```

### 3. All uncaptured output goes to pipeline
```powershell
# WRONG — function leaks output:
function Broken {
    'leaked'                           # Output 1
    $list = [System.Collections.ArrayList]::new()
    $list.Add(42)                      # .Add() returns index 0 — Output 2!
    return 'done'                      # Output 3
}
# CORRECT — suppress unwanted output:
function Fixed {
    [void]$list.Add(42)   # Suppressed
    return 'done'         # Only output
}
```

### 4. `-contains` is not substring check
```powershell
'hello world' -contains 'hello'        # $false! (not a collection)
@('hello', 'world') -contains 'hello'  # $true (collection membership)
'hello world' -match 'hello'           # $true (substring/regex)
```

### 5. Missing `$using:` in remote/parallel
```powershell
$name = 'svchost'
Invoke-Command -ComputerName S1 -ScriptBlock { Get-Process $name }         # $name is $null!
Invoke-Command -ComputerName S1 -ScriptBlock { Get-Process $using:name }   # CORRECT
```

### 6. Backtick line continuation (fragile)
```powershell
# FRAGILE — trailing whitespace after ` breaks silently:
Get-Process | `
    Where-Object CPU -gt 100
# BETTER — pipe at end of line naturally continues:
Get-Process |
    Where-Object CPU -gt 100
```

### 7. Array `+=` is O(n) per append
```powershell
# SLOW — copies entire array each iteration:
$arr = @(); foreach ($i in 1..10000) { $arr += $i }
# FAST — use Generic List:
$list = [System.Collections.Generic.List[object]]::new()
foreach ($i in 1..10000) { $list.Add($i) }
# Or let PowerShell collect pipeline output:
$arr = foreach ($i in 1..10000) { $i }
```

### 8. Single-element array unwrapping
```powershell
$r = @('only-one')
$r.GetType().Name        # String — unwrapped!
$r = @(Get-ChildItem *.log)   # Force array with @()
[array]$r = Get-ChildItem *.log  # Or type-constrain
```

### 9. Hashtable key order in [pscustomobject]
```powershell
# WRONG — key order is random:
[pscustomobject]@{ Z = 1; A = 2; M = 3 }
# CORRECT — [ordered] preserves insertion order:
[pscustomobject][ordered]@{ Z = 1; A = 2; M = 3 }
```

## Quick Reference

```text
TYPES:        [string] [int] [bool] [array] [hashtable] [pscustomobject] [datetime]
COMPARE:      -eq -ne -gt -lt -ge -le -like -match -contains -in  (case-insensitive!)
CASE-SENS:    -ceq -cne -cgt -clt -cge -cle -clike -cmatch
LOGIC:        -and -or -not -xor !
NULL:         $null -eq $var (LEFT side!)  ??  ??=  ${x}?.Prop
TERNARY:      $cond ? $ifTrue : $ifFalse
CHAIN:        cmd1 && cmd2 (on success)    cmd1 || cmd2 (on failure)
SCOPE:        $local: $script: $global: $private: $using:
SUCCESS:      $? (last PS cmd)    $LASTEXITCODE (last native exe)
IDENTITY:     $PSVersionTable  $IsLinux  $IsWindows  $IsMacOS
CONTEXT:      $PSScriptRoot  $PSCommandPath  $MyInvocation
PIPELINE:     $_ ($PSItem)  $input  $Matches
PRECEDENCE:   alias > function > cmdlet > external application
SUPPRESS:     [void]$x.Method()  or  $null = expr  or  | Out-Null
FORCE ARRAY:  @(expression)  or  [array]$var = expression
```
