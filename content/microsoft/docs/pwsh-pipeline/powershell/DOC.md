---
name: pwsh-pipeline
description: "PowerShell 7.5 pipeline semantics — object streaming, parameter binding, begin/process/end blocks, output streams, and pipeline operators"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,pipeline,streaming,parameter-binding,output-streams"
---

# PowerShell 7.5 Pipeline Semantics

You are a **PowerShell 7.5 pipeline expert**. This guide covers pipeline mechanics LLMs most frequently get wrong.

> Ground truth: Microsoft PowerShell documentation on learn.microsoft.com.

## Golden Rule: The Pipeline Passes Objects, Not Text

Every command emits **typed .NET objects**. The pipeline streams them one at a time. There is no text serialization between stages.

```powershell
Get-Process |                              # Emits [System.Diagnostics.Process] objects
    Where-Object { $_.CPU -gt 10 } |      # Filters on typed numeric property
    Sort-Object WorkingSet64 -Descending | # Sorts on [long] property
    Select-Object -First 5 Name, CPU      # Projects properties; stops pipeline after 5
```

## Pipeline Mechanics

### Streaming (One-at-a-Time)

Objects flow one at a time. The producer does not finish before the consumer starts.

```powershell
# Streaming — starts immediately, stops after 3 matches:
Get-ChildItem -Recurse -File |
    Where-Object { $_.Length -gt 1MB } |
    Select-Object -First 3   # Sends StopUpstreamCommandsException — halts all upstream

# Non-streaming — must complete before filtering begins:
$allFiles = Get-ChildItem -Recurse -File
$bigFiles = $allFiles | Where-Object { $_.Length -gt 1MB }
```

### Write-Output Is Implicit

Any uncaptured expression is implicitly sent to the success output stream:

```powershell
function Get-Greeting { "Hello, World" }   # Implicit Write-Output
# Explicit Write-Output is almost never needed. Only use for -NoEnumerate:
Write-Output @(1, 2, 3) -NoEnumerate   # Sends array as ONE object
```

### `return` Does Not Define "The" Return Value

`return` exits the scope and optionally adds to output. ALL uncaptured expressions contribute:

```powershell
function Bad-Example {
    'first'             # Output 1
    Get-Date            # Output 2
    return 'last'       # Output 3, then exits
}
# Returns THREE objects. Suppress unwanted output with [void] or $null =
```

## Parameter Binding

### Binding Order

1. **ByValue (type match)** — incoming object type matches a `ValueFromPipeline` parameter
2. **ByPropertyName** — object property names match `ValueFromPipelineByPropertyName` parameters

```powershell
# ByValue — entire object binds by type:
function Stop-Proc {
    param([Parameter(ValueFromPipeline)][System.Diagnostics.Process]$Process)
    process { $Process.Kill() }
}
Get-Process -Name notepad | Stop-Proc

# ByPropertyName — properties matched to parameter names:
function Show-FileInfo {
    param(
        [Parameter(ValueFromPipelineByPropertyName)][string]$Name,
        [Parameter(ValueFromPipelineByPropertyName)][long]$Length
    )
    process { "File: $Name, Size: $Length bytes" }
}
Get-ChildItem -File | Show-FileInfo   # .Name → -Name, .Length → -Length
```

Use `Trace-Command -Name ParameterBinding` to debug binding issues.

## begin/process/end Blocks

```powershell
function Process-Item {
    [CmdletBinding()]
    param([Parameter(ValueFromPipeline)][object]$InputObject)
    begin   { $count = 0 }              # ONCE before first object
    process { $count++; "Item: $_" }     # ONCE PER pipeline object
    end     { "Total: $count" }          # ONCE after last object
}
1, 2, 3 | Process-Item
```

### Critical Rules

**`$_` is ONLY valid in `process` block** (or ForEach-Object/Where-Object scriptblocks). In `begin`/`end`, `$_` is `$null`.

**Without `begin`/`process`/`end`**, the entire body is an implicit `end` block. Use `$input` to access pipeline input:

```powershell
function Collect-All {
    $all = @($input)   # Materialize the enumerator
    "Received $($all.Count) items"
}
1, 2, 3 | Collect-All   # "Received 3 items"
```

**`$input` is single-use** — iterating exhausts it. Materialize with `@($input)` if you need multiple passes.

In a function WITH a `process` block, `$input` is empty (objects go to `$_` instead).

## Output Streams

| # | Name | Cmdlet | Pipeline? |
|---|---|---|---|
| 1 | Success | `Write-Output` (implicit) | Yes |
| 2 | Error | `Write-Error` | No |
| 3 | Warning | `Write-Warning` | No |
| 4 | Verbose | `Write-Verbose` | No |
| 5 | Debug | `Write-Debug` | No |
| 6 | Information | `Write-Information`, `Write-Host` | No |

**`Write-Host` writes to Stream 6** — it does NOT pollute pipeline output.

```powershell
function Get-Data {
    Write-Host 'Loading...'       # Stream 6 — display only
    Write-Verbose 'Querying...'   # Stream 4 — only with -Verbose
    @{Name = 'result'}            # Stream 1 — THIS is pipeline output
}
$data = Get-Data   # $data is the hashtable, not "Loading..."
```

### Stream Redirection

```powershell
Get-ChildItem /x 2>&1    # Merge error → success stream
& { Write-Warning 'w'; 'out' } *>&1   # Merge ALL → success
Get-Process 2>$null       # Discard errors
Get-Process 1>out.txt 2>err.txt   # Redirect to files
```

### ErrorAction and try/catch

Non-terminating errors do NOT trigger `catch` by default:

```powershell
# WRONG — catch is skipped:
try { Get-Item /nonexistent } catch { "Caught: $_" }
# CORRECT — make it terminating:
try { Get-Item /nonexistent -ErrorAction Stop } catch { "Caught: $_" }
```

## Pipeline Operators

### ForEach-Object (alias: %)

```powershell
Get-Service | ForEach-Object { "$($_.Name): $($_.Status)" }
# With begin/process/end:
1..5 | ForEach-Object -Begin { $s = 0 } -Process { $s += $_ } -End { $s }
# Parallel (PowerShell 7+) — REQUIRES $using: for parent variables:
$prefix = 'Item'
1..10 | ForEach-Object -Parallel { "$($using:prefix): $_" } -ThrottleLimit 5
```

### Where-Object (alias: ?)

```powershell
Get-Process | Where-Object { $_.WorkingSet64 -gt 100MB }
Get-Process | Where-Object WorkingSet64 -gt 100MB   # Simplified syntax
Get-Service | Where-Object { $_.Status -eq 'Running' -and $_.StartType -eq 'Automatic' }
```

### Select-Object

```powershell
Get-Process | Select-Object Name, CPU                    # Project properties
Get-Process | Sort-Object CPU -Desc | Select-Object -First 10   # Top N
Get-Process | Select-Object Name, @{N='MemMB';E={[math]::Round($_.WorkingSet64/1MB,1)}}  # Calculated
Get-ChildItem | Select-Object -ExpandProperty Name       # Unwrap to raw values
Get-Process | Select-Object -Property Name -Unique       # Deduplicate
```

### Sort-Object

```powershell
Get-Process | Sort-Object CPU -Descending
Get-ChildItem | Sort-Object @{Expression='Extension';Ascending=$true}, @{Expression='Length';Descending=$true}
Get-Process | Sort-Object CPU -Stable   # Preserve relative order (PowerShell 7+)
```

### Group-Object

```powershell
Get-Service | Group-Object Status   # Returns Count, Name, Group
$byStatus = Get-Service | Group-Object Status -AsHashTable -AsString
$byStatus['Running']   # Fast lookup
```

### Measure-Object

```powershell
Get-ChildItem | Measure-Object                                # .Count
Get-ChildItem -File | Measure-Object Length -Sum -Average -Max -Min
Get-Content file.txt | Measure-Object -Line -Word -Character
```

## Pipeline vs Method Syntax

PowerShell 4+ provides `.ForEach()` and `.Where()` collection methods:

| Feature | Pipeline (`\|`) | Method (`.ForEach()`) |
|---|---|---|
| Execution | Streaming (one at a time) | Batch (collects all first) |
| Memory | Constant for streaming | Proportional to collection |
| Speed | Slower per-item overhead | Faster for in-memory data |
| Use when | Large/unknown-size streams | Already-collected arrays |

```powershell
# Pipeline — constant memory, works with huge streams:
Get-Content hugefile.txt | Where-Object { $_ -match 'ERROR' }
# Method — faster for in-memory collections:
$procs = Get-Process
$heavy = $procs.Where({ $_.WorkingSet64 -gt 100MB })
$names = $procs.ForEach({ $_.Name })
```

`.Where()` supports mode parameters:

```powershell
$nums = 1..20
$nums.Where({ $_ -gt 10 }, 'Split')       # [0]=matching, [1]=non-matching
$nums.Where({ $_ -gt 5 }, 'First')        # First match: 6
$nums.Where({ $_ -gt 5 }, 'Until')        # Items before first match: 1..5
$nums.Where({ $_ -gt 5 }, 'SkipUntil')    # From first match onward: 6..20
```

## Common Mistakes

### 1. Using $_ outside pipeline context
```powershell
# WRONG — $_ is $null outside the pipeline:
$items = Get-ChildItem
$items | ForEach-Object { $n = $_.Name }
Write-Host $_.Name   # $null!
# CORRECT — capture in a variable inside the pipeline block
```

### 2. Treating output as text
```powershell
# WRONG (bash thinking):
$procs = Get-Process | Out-String
if ($procs -match 'chrome') { 'found' }
# CORRECT (object thinking):
if (Get-Process | Where-Object ProcessName -eq 'chrome') { 'found' }
```

### 3. Forgetting $using: in -Parallel
```powershell
# WRONG — $logPath is $null:
$logPath = '/var/log/app.log'
1..10 | ForEach-Object -Parallel { Add-Content $logPath "Item $_" }
# CORRECT:
1..10 | ForEach-Object -Parallel { Add-Content $using:logPath "Item $_" }
```

### 4. Leaking unwanted output to pipeline
```powershell
# WRONG — .ContainsKey() and .Count leak to output:
function Init {
    $d = [System.Collections.Generic.Dictionary[string,string]]::new()
    $d.Add('key', 'val')
    $d.ContainsKey('key')   # $true leaked!
    $d.Count                # 1 leaked!
    return $d
}
# CORRECT:
function Init {
    $d = [System.Collections.Generic.Dictionary[string,string]]::new()
    $d.Add('key', 'val')
    $null = $d.ContainsKey('key')
    return $d
}
```

### 5. Not understanding streaming vs collecting
```powershell
# Function emits objects ONE AT A TIME, not as array:
function Get-Numbers { 1; 2; 3 }
$result = Get-Numbers           # PowerShell collects → Object[]
Get-Numbers | ForEach-Object { "Got: $_" }  # 3 iterations, not 1
```

### 6. Confusing Select-Object vs -ExpandProperty
```powershell
Get-Process | Select-Object Name         # PSCustomObject with .Name property
Get-Process | Select-Object -ExpandProperty Name  # Raw string values
(Get-Process).Name                       # Same as -ExpandProperty but non-streaming
```

### 7. Non-terminating errors skip catch
```powershell
try { Get-Item /x } catch { "Caught" }                    # catch SKIPPED
try { Get-Item /x -ErrorAction Stop } catch { "Caught" }  # catch RUNS
```

### 8. Writing explicit Write-Output
```powershell
# UNNECESSARY — Write-Output is implicit:
function Get-X { Write-Output "Hello" }
# IDIOMATIC:
function Get-X { "Hello" }
```

## Quick Reference

```text
PIPELINE:       cmd1 | cmd2 | cmd3       Objects stream one-at-a-time
BINDING:        ByValue (type) first, then ByPropertyName
BLOCKS:         begin { once } process { per-object } end { once }
CURRENT OBJ:    $_ or $PSItem            Only in process block / ForEach / Where
BULK INPUT:     $input                   Only in end block (no process) or scripts

STREAMS:        1=Success  2=Error  3=Warning  4=Verbose  5=Debug  6=Information
REDIRECT:       2>&1 (errors→success)   *>&1 (all→success)   2>$null (discard)
WRITE-HOST:     Stream 6 — never enters pipeline

FILTER:         | Where-Object { $_.Prop -gt 5 }     or: | ? Prop -gt 5
TRANSFORM:      | ForEach-Object { $_.Prop.ToUpper() }
PROJECT:        | Select-Object P1, P2, @{N='X';E={calc}}
UNWRAP:         | Select-Object -ExpandProperty Prop  or: (cmd).Prop
SORT:           | Sort-Object Prop -Descending
GROUP:          | Group-Object Prop -AsHashTable -AsString
COUNT:          | Measure-Object -Sum -Average -Property Prop
FIRST/LAST:     | Select-Object -First N -Last N      (-First stops pipeline)
PARALLEL:       | ForEach-Object -Parallel { $using:var; $_ } -ThrottleLimit 5
METHODS:        $arr.ForEach({ expr })   $arr.Where({ cond }, 'Mode')
SUPPRESS:       [void]$x.Method()  or  $null = expr  or  | Out-Null
ERRORACTION:    -ErrorAction Stop  to make non-terminating → terminating
```
