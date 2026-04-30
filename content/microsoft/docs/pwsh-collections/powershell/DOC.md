---
name: pwsh-collections
description: "PowerShell 7.5 collections — arrays, hashtables, ordered dictionaries, ArrayList, generic lists, splatting, and collection operators"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,arrays,hashtables,splatting,collections,generics"
---

# PowerShell 7.5 — Collections

What LLMs consistently get wrong about PowerShell collections.

## Golden Rule: Arrays Are FIXED SIZE — `+=` Creates a New Array Every Time

```powershell
# TERRIBLE — O(n^2), creates 10,000 new arrays
$result = @()
foreach ($i in 1..10000) {
    $result += $i
}

# CORRECT — O(n), mutable list
$result = [System.Collections.Generic.List[object]]::new()
foreach ($i in 1..10000) {
    $result.Add($i)
}

# BEST for simple cases — collect output directly
$result = foreach ($i in 1..10000) { $i }
# Or: $result = 1..10000 | ForEach-Object { $_ * 2 }
```

For 10,000 elements, `+=` is ~100x slower. For 100,000 elements, thousands of times
slower with gigabytes of garbage allocations.

## Array Creation

```powershell
$empty = @()                     # Empty array
$single = @(42)                  # Single-element array
$multi = 1, 2, 3                 # Comma operator
$single2 = , 42                  # Unary comma: single-element array
$range = 1..10                   # Range operator
$typed = [int[]]@(1, 2, 3)      # Typed array (enforces type)

# @() guarantees array result (critical for uncertain counts)
$files = @(Get-ChildItem *.log)  # Always array, even for 0 or 1 results
```

## Array Slicing

```powershell
$arr = 10, 20, 30, 40, 50
$arr[0]          # 10
$arr[-1]         # 50 (last)
$arr[1..3]       # @(20, 30, 40)
$arr[0, 2, 4]    # @(10, 30, 50)
$arr[99]         # $null (no error on out-of-bounds)

# GOTCHA: Not like Python slicing
$arr[2..-1]      # @(30, 20, 10, 50) — range 2,1,0,-1 = indices 2,1,0,4!
# For "index 2 to end":
$arr[2..($arr.Length - 1)]
```

## Hashtables `@{}`

```powershell
$hash = @{ Name = "Sean"; Age = 30 }
$hash['Name']           # Sean (index)
$hash.Name              # Sean (dot notation)
$hash.Count             # 2
```

### Keys Are Case-INSENSITIVE by Default

```powershell
$hash = @{ Name = "Sean" }
$hash['name']    # Sean
$hash['NAME']    # Sean
```

### Key Order Is NOT Guaranteed

```powershell
$hash = @{ First = 1; Second = 2; Third = 3 }
$hash.Keys    # Could be any order!
```

### Adding, Removing, Checking

```powershell
$hash['Key'] = 'value'           # Add or overwrite (silent)
$hash.Add('Key2', 'value2')      # Add (throws on duplicate!)
$hash.Remove('Key')              # Remove
$hash.ContainsKey('Key2')        # True
```

### Iterating — Must Use `.GetEnumerator()` for Pipeline

```powershell
# WRONG — passes entire hashtable as single object
$hash | ForEach-Object { $_.Key }

# CORRECT
$hash.GetEnumerator() | ForEach-Object { "$($_.Key) = $($_.Value)" }

# Also correct (foreach statement does not need .GetEnumerator())
foreach ($key in $hash.Keys) { "$key = $($hash[$key])" }
```

### Cannot Modify While Iterating

```powershell
# WRONG — "Collection was modified" error
foreach ($key in $hash.Keys) { $hash.Remove($key) }

# CORRECT — snapshot keys first
foreach ($key in @($hash.Keys)) { $hash.Remove($key) }
```

## Ordered Dictionaries `[ordered]@{}`

```powershell
$ordered = [ordered]@{ First = 1; Second = 2; Third = 3 }
$ordered.Keys    # Always: First, Second, Third
$ordered[0]      # 1 (index-based access works)
```

`[ordered]` is ONLY valid immediately before `@{}`. Cannot cast existing hashtable.

```powershell
$hash = @{ A = 1 }
[ordered]$hash        # ERROR — cannot convert
```

## Splatting — `@params` Not `$params`

Splatting unpacks a collection into command parameters.

```powershell
$params = @{
    Path    = "/tmp"
    Filter  = "*.log"
    Recurse = $true          # Switch params use $true/$false
}
Get-ChildItem @params        # Splats into named parameters

# WRONG — passes hashtable as single argument
Get-ChildItem $params
```

### Array Splatting (Positional)

```powershell
$args = @("Hello", "World")
Write-Host @args             # Write-Host "Hello" "World"
```

### Dynamic Parameter Building

```powershell
$params = @{ Path = "/tmp" }
if ($recurse) { $params['Recurse'] = $true }
if ($filter)  { $params['Filter'] = $filter }
Get-ChildItem @params
```

## Generic Collections

### `[System.Collections.Generic.List[T]]` — Use This, Not ArrayList

```powershell
$list = [System.Collections.Generic.List[string]]::new()
$list.Add("first")               # Returns void (clean!)
$list.AddRange(@("second", "third"))
$list.Insert(0, "zeroth")
$list.Remove("second")           # Returns bool
$list.RemoveAt(0)
$list.Contains("first")          # True
$list.Sort()
$list.Count                      # Element count
```

**Why not ArrayList?** `.Add()` returns the index, cluttering the pipeline:

```powershell
$al = [System.Collections.ArrayList]::new()
$al.Add("item")    # Outputs 0 (index) — must suppress with [void]

$list = [System.Collections.Generic.List[object]]::new()
$list.Add("item")  # Returns void — clean
```

### `[Dictionary[TKey, TValue]]`

```powershell
$dict = [System.Collections.Generic.Dictionary[string, int]]::new()
$dict["apples"] = 5
$dict.ContainsKey("apples")      # True

# TryGetValue pattern
$value = 0
if ($dict.TryGetValue("apples", [ref]$value)) { "Found: $value" }

# Case-insensitive keys
$dict = [System.Collections.Generic.Dictionary[string, int]]::new(
    [StringComparer]::OrdinalIgnoreCase)
```

### Queue, Stack, HashSet

```powershell
# Queue — FIFO
$q = [System.Collections.Generic.Queue[string]]::new()
$q.Enqueue("first"); $q.Dequeue()   # "first"

# Stack — LIFO
$s = [System.Collections.Generic.Stack[string]]::new()
$s.Push("first"); $s.Push("second"); $s.Pop()   # "second"

# HashSet — unique elements, set operations
$set = [System.Collections.Generic.HashSet[int]]::new([int[]]@(1,2,3))
$set.Add(2)              # False (already exists)
$set.IntersectWith([int[]]@(2,3,4))  # Mutates in place! $set = {2,3}
```

## Group-Object, Sort-Object, Measure-Object

```powershell
# Group and get lookup hashtable
$lookup = Get-Process | Group-Object Name -AsHashTable
$lookup['pwsh']        # All pwsh processes

# Sort with multiple properties
Get-ChildItem | Sort-Object @{E="Extension";Desc=$true}, Name
1,3,2,3,1 | Sort-Object -Unique    # 1, 2, 3

# Measure
1..100 | Measure-Object -Sum -Average -Min -Max
Get-Content file.txt | Measure-Object -Line -Word -Character
```

## Array Operators

### Containment — `-contains`/`-in` Test Element Equality

```powershell
$arr = 1, 2, 3, 4, 5
$arr -contains 3           # True (array on LEFT)
3 -in $arr                 # True (array on RIGHT)
$arr -notcontains 6        # True

# NOT substring matching!
"Hello","World" -contains "Hell"     # False (no element equals "Hell")
```

### `-contains` vs `.Contains()` — Different!

```powershell
@("Hello","World") -contains "hello"     # True  (case-insensitive)
@("Hello","World").Contains("hello")     # False (case-SENSITIVE)
"Hello World".Contains("World")          # True  (substring match)
```

### Comparison Operators on Arrays Return Filtered Results

```powershell
@(1, 2, 3, 4, 5) -gt 3        # @(4, 5) — NOT a boolean!
5 -gt 3                        # True    — scalar returns boolean

$names = "Alice", "Bob", "Charlie"
$names -like "?????*"          # @("Alice", "Charlie") — 5+ chars
$names -match "^[AB]"          # @("Alice", "Bob")
```

**Critical:** Array on left = filtered array returned. Scalar on left = boolean.

## Pipeline Collection Behavior

```powershell
# Pipeline unrolls arrays
1, 2, 3 | ForEach-Object { "Item: $_" }   # Three iterations

# Pass array as single object with unary comma
, @(1, 2, 3) | ForEach-Object { "Count: $($_.Count)" }   # Count: 3

# Collecting output may return scalar for single result
$result = Get-ChildItem *.txt   # Might be scalar
$result = @(Get-ChildItem *.txt)  # Always array
```

## Common Mistakes

**1. `+=` on arrays in loops:** O(n^2) performance disaster. Use
`[System.Collections.Generic.List[object]]` or collect from `foreach` output.

**2. Splatting with `$` instead of `@`:** `Get-ChildItem $params` passes the
hashtable as an argument. Use `@params`.

**3. Expecting hashtable key order:** `@{}` is unordered. Use `[ordered]@{}`.

**4. Piping hashtable directly:** `@{A=1} | ForEach-Object { $_.Key }` fails.
Use `.GetEnumerator()`.

**5. ArrayList instead of Generic List:** `[ArrayList].Add()` outputs the index.
`[List[T]].Add()` returns void.

**6. `-contains` for substrings:** `-contains` checks array element equality, not
substring. Use `-match`, `-like "*X*"`, or `.Contains()`.

**7. Modifying collection while iterating:** Snapshot with `@($collection)` first,
or use `.RemoveAll()`.

**8. Missing `@()` wrapper:** Single result from cmdlet is a scalar, not array.
`@(Get-ChildItem)` is always safe.

**9. Array comparison returns array, not bool:** `@(1,2,3) -gt 2` returns `@(3)`,
not `$true`. Use `-contains` for boolean checks.

**10. `[ordered]` context:** Only valid as `[ordered]@{...}`. Cannot cast existing
hashtable. Cannot use as a standalone type.

**11. Unary comma for single-element arrays:** `, $value` wraps in array. Forgetting
this when passing to APIs that distinguish scalar vs array.

**12. `.Contains()` is case-sensitive:** `@("Hello").Contains("hello")` is `$false`.
The `-contains` operator is case-insensitive.
