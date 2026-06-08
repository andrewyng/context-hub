---
name: pwsh-jobs-async
description: "PowerShell 7.5 parallel execution — ForEach-Object -Parallel, Start-ThreadJob, background jobs, runspaces, and async patterns"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,parallel,threadjob,foreach-parallel,jobs,runspaces,async"
---

# PowerShell 7.5 Parallel Execution and Async Patterns

## Golden Rule

**`ForEach-Object -Parallel` is the PS7 way.** It uses runspaces, is far lighter than `Start-Job`, and is the default choice for parallel iteration. Use `Start-ThreadJob` when you need a job object without process isolation. Reserve `Start-Job` only when you need full process isolation.

## ForEach-Object -Parallel

```powershell
1..10 | ForEach-Object -Parallel {
    "Processing $_ on thread $([Threading.Thread]::CurrentThread.ManagedThreadId)"
    Start-Sleep 1
} -ThrottleLimit 5
```

- Pipeline input available as `$_` / `$PSItem`.
- `-ThrottleLimit` controls max concurrent runspaces (**default: 5**).
- Each iteration runs in its own runspace — **separate scope, no shared state**.
- Output order is **non-deterministic**.

### $using: for Local Variables

Variables from the calling scope are NOT visible inside `-Parallel`. Use `$using:`.

```powershell
$logPath = '/var/log/app'
$threshold = 100
Get-ChildItem $logPath -Filter '*.log' | ForEach-Object -Parallel {
    $errors = (Get-Content "$($using:logPath)/$($_.Name)" | Select-String 'ERROR').Count
    if ($errors -gt $using:threshold) { [PSCustomObject]@{ File = $_.Name; Errors = $errors } }
} -ThrottleLimit 4
```

`$using:` values are **read-only copies**. You cannot write back to the caller's scope.

### -AsJob for Async

```powershell
$job = 1..20 | ForEach-Object -Parallel {
    Start-Sleep (Get-Random -Minimum 1 -Maximum 5); "Done: $_"
} -ThrottleLimit 5 -AsJob

# Do other work...
$results = Receive-Job $job -Wait
Remove-Job $job
```

### No Pipeline Blocks Inside -Parallel

```powershell
# WRONG — begin/process/end not supported in -Parallel
1..5 | ForEach-Object -Parallel {
    begin { $total = 0 }      # ERROR
    process { $total += $_ }
}
# RIGHT — each iteration is independent
$results = 1..5 | ForEach-Object -Parallel { $_ * 2 }
```

## Start-ThreadJob

Runs in the **same process** in a separate runspace. Bundled with PS 7.5.

```powershell
$job = Start-ThreadJob -ScriptBlock {
    param($Path, $Filter)
    Get-ChildItem -Path $Path -Filter $Filter -Recurse
} -ArgumentList '/var/log', '*.log'

$results = Receive-Job $job -Wait -AutoRemoveJob
```

Both `-ArgumentList` with `param()` and `$using:` work with `Start-ThreadJob`.

### Multiple ThreadJobs

```powershell
$jobs = foreach ($server in 'web01', 'web02', 'db01') {
    Start-ThreadJob -ScriptBlock {
        Invoke-Command -HostName $using:server -ScriptBlock { Get-Uptime }
    }
}
$results = $jobs | Receive-Job -Wait -AutoRemoveJob
```

## Start-Job (Background Process)

Runs in a **separate process** — full isolation but serialization overhead and high memory.

```powershell
$job = Start-Job -ScriptBlock { param($Dir) Get-ChildItem $Dir -Recurse | Measure-Object } -ArgumentList '/var/log'
$result = Receive-Job $job -Wait -AutoRemoveJob
```

`$using:` works in PS7 Start-Job, but values are serialized across process boundaries (same deserialization rules as remoting).

**Use Start-Job only when you need:** process isolation, crash protection, or assembly conflict avoidance. Otherwise prefer ThreadJob or -Parallel.

## Performance Comparison

| Feature | `ForEach-Object -Parallel` | `Start-ThreadJob` | `Start-Job` |
|---------|---------------------------|-------------------|-------------|
| Execution | Runspace pool | Single runspace | Separate process |
| Overhead | Low | Low | High |
| Serialization | No (same process) | No (same process) | Yes (cross-process) |
| `$using:` | Yes (read-only) | Yes | Yes (serialized) |
| Pipeline input | Yes (`$_`) | No | No |
| Job object | Only with `-AsJob` | Always | Always |
| Default throttle | 5 | Manual | Manual |
| Memory per unit | ~2-5 MB | ~2-5 MB | ~30-80 MB |
| Startup time | Milliseconds | Milliseconds | Seconds |

## Job Management

```powershell
$job = Start-ThreadJob { long-running-work }
Get-Job                              # List all jobs
$job.State                           # Running, Completed, Failed
Receive-Job $job                     # Get available output (non-blocking)
Receive-Job $job -Wait               # Block until complete
Receive-Job $job -Wait -AutoRemoveJob  # Wait + get output + cleanup
Stop-Job $job                        # Signal stop
Remove-Job $job                      # Remove (must be stopped/completed)
Remove-Job $job -Force               # Force-remove even if running
```

### Collecting from Multiple Jobs

```powershell
$jobs = 1..5 | ForEach-Object {
    $num = $_
    Start-ThreadJob { Start-Sleep 2; "Result from $using:num" }
}
$results = $jobs | Receive-Job -Wait -AutoRemoveJob
```

## Error Handling

### In ForEach-Object -Parallel

Errors from one iteration do NOT stop others. Capture via the output stream:

```powershell
$results = 1..5 | ForEach-Object -Parallel {
    if ($_ -eq 3) { throw "Item 3 failed" }
    "OK: $_"
} 2>&1

$results | ForEach-Object {
    if ($_ -is [System.Management.Automation.ErrorRecord]) { "ERROR: $($_.Exception.Message)" }
    else { $_ }
}
```

### In Jobs

```powershell
$job = Start-ThreadJob { throw "Something went wrong" }
Wait-Job $job
$job.State  # Failed
try { Receive-Job $job -Wait -ErrorAction Stop }
catch { "Job failed: $_" }
Remove-Job $job
```

## Thread-Safe Collections

When parallel iterations write to a shared collection, use `System.Collections.Concurrent`:

```powershell
# ConcurrentBag (unordered, thread-safe)
$bag = [System.Collections.Concurrent.ConcurrentBag[object]]::new()
1..100 | ForEach-Object -Parallel {
    ($using:bag).Add([PSCustomObject]@{ Id = $_; Squared = $_ * $_ })
} -ThrottleLimit 10
$bag.Count  # 100

# ConcurrentDictionary
$dict = [System.Collections.Concurrent.ConcurrentDictionary[string, int]]::new()
Get-ChildItem *.log | ForEach-Object -Parallel {
    $lines = (Get-Content $_.FullName | Measure-Object -Line).Lines
    ($using:dict).TryAdd($_.Name, $lines) | Out-Null
}
```

**Regular collections (ArrayList, List\<T\>) are NOT thread-safe** and will corrupt data or throw in parallel scenarios.

## Advanced: Runspace Pools

For maximum control (rarely needed — prefer `-Parallel`):

```powershell
$pool = [runspacefactory]::CreateRunspacePool(1, 10)
$pool.Open()
$tasks = foreach ($i in 1..20) {
    $ps = [powershell]::Create().AddScript({ param($n) Start-Sleep 1; "Processed $n" }).AddArgument($i)
    $ps.RunspacePool = $pool
    @{ PS = $ps; Handle = $ps.BeginInvoke() }
}
$results = foreach ($t in $tasks) { $t.PS.EndInvoke($t.Handle); $t.PS.Dispose() }
$pool.Close(); $pool.Dispose()
```

## Common Mistakes LLMs Make

### Mistake 1: Forgetting $using: in -Parallel Blocks
```powershell
# WRONG — $path is $null inside the parallel scriptblock
$path = '/var/log'
Get-ChildItem $path | ForEach-Object -Parallel { Get-Content "$path/$($_.Name)" }
# RIGHT
Get-ChildItem $path | ForEach-Object -Parallel { Get-Content "$($using:path)/$($_.Name)" }
```

### Mistake 2: Trying to Modify $using: Variables
```powershell
# WRONG — $using: is a read-only copy
$counter = 0
1..10 | ForEach-Object -Parallel { $using:counter++ }  # ERROR
# RIGHT — use a thread-safe collection
$bag = [System.Collections.Concurrent.ConcurrentBag[int]]::new()
1..10 | ForEach-Object -Parallel { ($using:bag).Add($_) }
```

### Mistake 3: Using Start-Job When -Parallel or ThreadJob Suffices
```powershell
# WASTEFUL — 50 new processes at ~30-80 MB each
$jobs = 1..50 | ForEach-Object { Start-Job { param($n) $n * 2 } -ArgumentList $_ }
# BETTER
$results = 1..50 | ForEach-Object -Parallel { $_ * 2 } -ThrottleLimit 10
```

### Mistake 4: Expecting Ordered Output from -Parallel
```powershell
# Output is NOT in input order — items complete whenever their runspace finishes
$out = 1..10 | ForEach-Object -Parallel { Start-Sleep (Get-Random -Max 3); $_ }
# Sort explicitly if order matters
$out = 1..10 | ForEach-Object -Parallel {
    [PSCustomObject]@{ Order = $_; Value = $_ * 2 }
} | Sort-Object Order
```

### Mistake 5: Using Non-Thread-Safe Collections
```powershell
# WRONG — ArrayList is not thread-safe
$list = [System.Collections.ArrayList]::new()
1..1000 | ForEach-Object -Parallel { ($using:list).Add($_) | Out-Null }  # Race condition!
# RIGHT — ConcurrentBag
$bag = [System.Collections.Concurrent.ConcurrentBag[int]]::new()
1..1000 | ForEach-Object -Parallel { ($using:bag).Add($_) }
```

### Mistake 6: Not Understanding -ThrottleLimit Default
The default is **5**, not unlimited. Set it explicitly for your workload:
```powershell
1..1000 | ForEach-Object -Parallel { Invoke-RestMethod "https://api.example.com/$_" } -ThrottleLimit 20
```

### Mistake 7: Wrong $using: Capture in Loops
```powershell
# WRONG — $_ in the ForEach scope is not what you think in $using:
$items = 1..5
$items | ForEach-Object { Start-ThreadJob { "Processing $using:_" } }  # $_ ambiguous
# RIGHT — capture to a named variable first
$items | ForEach-Object {
    $item = $_
    Start-ThreadJob { "Processing $using:item" }
}
```

### Mistake 8: Forgetting -Wait on Receive-Job
```powershell
# WRONG — returns nothing if job hasn't finished yet
$job = Start-ThreadJob { Start-Sleep 5; "Done" }
$result = Receive-Job $job  # Empty!
# RIGHT
$result = Receive-Job $job -Wait
```

### Mistake 9: Not Cleaning Up Jobs
```powershell
# WRONG — jobs accumulate in the session
foreach ($i in 1..100) {
    $job = Start-ThreadJob { "work" }
    Receive-Job $job -Wait  # Job still exists!
}
Get-Job | Measure-Object  # 100 stale jobs
# RIGHT
Receive-Job $job -Wait -AutoRemoveJob
```

### Mistake 10: Using -Parallel for Trivial or Sequential Work
```powershell
# WASTEFUL — runspace overhead exceeds benefit for fast operations
1..5 | ForEach-Object -Parallel { $_ * 2 }
# BETTER — regular ForEach-Object for CPU-bound, small-collection, or sequential work
1..5 | ForEach-Object { $_ * 2 }
```

## Quick Reference

| Task | Command |
|------|---------|
| Parallel iteration | `items \| ForEach-Object -Parallel { ... } -ThrottleLimit N` |
| Async parallel | `items \| ForEach-Object -Parallel { ... } -AsJob` |
| Lightweight job | `Start-ThreadJob -ScriptBlock { ... }` |
| Isolated job | `Start-Job -ScriptBlock { ... }` |
| Wait + collect | `Receive-Job $job -Wait -AutoRemoveJob` |
| Check all jobs | `Get-Job` |
| Clean completed | `Get-Job -State Completed \| Remove-Job` |
| Pass variable | `$using:varName` |
| Thread-safe add | `[Concurrent.ConcurrentBag[T]]::new()` |
