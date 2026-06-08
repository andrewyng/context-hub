---
name: pwsh-objects
description: "PowerShell 7.5 object model — PSCustomObject, Add-Member, Select-Object, type accelerators, member enumeration, and type conversion"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,objects,pscustomobject,add-member,select-object,types"
---

# PowerShell 7.5 — Objects

What LLMs consistently get wrong about PowerShell's object model.

## Golden Rule: Everything Is an Object

PowerShell pipeline passes **objects**, not text. Screen output is a formatted view.

```powershell
$p = Get-Process -Name pwsh
$p.Id              # PID (int)
$p.WorkingSet64    # Memory in bytes (long)
$p.StartTime       # DateTime object
```

Parsing text output with regex is almost always wrong. Access properties directly.

## `[PSCustomObject]@{}` — The Right Way to Create Objects

```powershell
$obj = [PSCustomObject]@{
    Name = "Sean"
    Age  = 30
    Role = "Admin"
}
$obj.Name    # Sean
```

Properties retain insertion order (implicit `[ordered]` for this pattern).

### WRONG: `New-Object` with Hashtable

```powershell
# Property order is NOT guaranteed — uses unordered hashtable
$obj = New-Object PSObject -Property @{ Name = "Sean"; Age = 30; Role = "Admin" }
```

### Hashtable vs PSCustomObject — Not Interchangeable

```powershell
$hash = @{ Name = "Sean" }          # Hashtable
$obj = [PSCustomObject]@{ Name = "Sean" }  # PSCustomObject

$hash.Keys                # Works (Hashtable method)
$obj.Keys                 # $null (no .Keys on PSCustomObject)

$hash | Select-Object Name     # EMPTY — hashtable keys are not properties
$obj | Select-Object Name      # Name = Sean — works as expected
```

Cmdlets expect objects with properties, not hashtables.

## Add-Member

```powershell
$obj = [PSCustomObject]@{ Name = "Sean" }

# NoteProperty — static data
$obj | Add-Member NoteProperty Email "sean@example.com"

# ScriptProperty — computed on access ($this = the object)
$obj | Add-Member ScriptProperty Upper { $this.Name.ToUpper() }

# ScriptMethod
$obj | Add-Member ScriptMethod Greet { "Hello, $($this.Name)" }

$obj.Email    # sean@example.com
$obj.Upper    # SEAN
$obj.Greet()  # Hello, Sean
```

**Gotchas:**
- `Add-Member` returns nothing by default. Use `-PassThru` to chain.
- Duplicate property names error unless you use `-Force`.
- `Add-Member` modifies the object in place (no assignment needed).

## Select-Object

### Property Selection Creates NEW Objects

```powershell
$p = Get-Process -Name pwsh | Select-Object Name, Id
$p.GetType().Name    # PSCustomObject (NOT Process!)
$p.Kill()            # ERROR: method does not exist
```

### Calculated Properties

```powershell
Get-Process | Select-Object Name, @{N='MemMB'; E={[math]::Round($_.WS / 1MB, 2)}}
```

Aliases: `N`/`Name`/`Label`/`L` for name, `E`/`Expression` for expression.

### `-ExpandProperty` — Get Raw Values

```powershell
Get-Process | Select-Object Name           # Returns PSCustomObjects with .Name
Get-Process | Select-Object -ExpandProperty Name  # Returns raw strings
```

### `-First`, `-Last`, `-Skip`, `-Unique`

```powershell
1..100 | Select-Object -First 5             # 1..5 (stops pipeline early)
1..100 | Select-Object -Last 3              # 98..100 (buffers everything)
1..100 | Select-Object -Skip 10 -First 5    # 11..15
1,2,2,3,3 | Select-Object -Unique           # 1,2,3
```

## Member Enumeration (PS 3+)

Accessing a property on a collection returns that property from each element:

```powershell
$procs = Get-Process
$procs.Name         # Array of all process names

$names = @("hello", "world")
$names.ToUpper()    # @("HELLO", "WORLD")
```

### The `.Count`/`.Length` Ambiguity

```powershell
$files = Get-ChildItem *.txt
$files.Length    # Number of files (array property wins over FileInfo.Length)
# To get file sizes: $files | ForEach-Object { $_.Length }
```

When collection and elements share a property name, the collection's property wins.

### Single-Element Gotcha

```powershell
$files = Get-ChildItem *.txt    # Might return 1 FileInfo, not an array
$files.Count                    # Could be $null on single FileInfo

# SAFE: always wrap in @()
$files = @(Get-ChildItem *.txt)
$files.Count                    # Always works
```

## Type Accelerators

| Accelerator | .NET Type | Accelerator | .NET Type |
|-------------|-----------|-------------|-----------|
| `[string]` | System.String | `[datetime]` | System.DateTime |
| `[int]` | System.Int32 | `[timespan]` | System.TimeSpan |
| `[long]` | System.Int64 | `[guid]` | System.Guid |
| `[bool]` | System.Boolean | `[uri]` | System.Uri |
| `[double]` | System.Double | `[version]` | System.Version |
| `[decimal]` | System.Decimal | `[regex]` | System.Text.RegularExpressions.Regex |
| `[array]` | System.Array | `[xml]` | System.Xml.XmlDocument |
| `[hashtable]` | System.Collections.Hashtable | `[ipaddress]` | System.Net.IPAddress |
| `[psobject]` | System.Management.Automation.PSObject | `[scriptblock]` | ScriptBlock |
| `[pscustomobject]` | System.Management.Automation.PSObject | `[ordered]` | OrderedDictionary |
| `[semver]` | SemanticVersion | `[switch]` | SwitchParameter |

Note: `[pscustomobject]` and `[psobject]` map to the **same type**. The difference is
syntactic: `[PSCustomObject]@{}` triggers ordered-property creation.

## Casting and Type Conversion

### Left Operand Determines the Operation

```powershell
"5" + 3     # "53" (string concatenation)
5 + "3"     # 8    (numeric addition)
```

### Explicit Casting

```powershell
[int]"42"                    # 42
[datetime]"2026-03-30"       # DateTime object
[version]"1.2.3"             # Version object
[int[]]@("1","2","3")        # Typed int array
```

### `[bool]` Conversion Trap

```powershell
[bool]""           # False
[bool]"False"      # True! (non-empty string is truthy)
[bool]$null        # False
[bool]0            # False
[bool]@()          # False (empty array)
[bool]@(0)         # True  (non-empty array)

# For string-to-bool parsing:
[System.Convert]::ToBoolean("False")    # False (correct)
```

## Where-Object

```powershell
# Script block syntax (multiple conditions)
Get-Process | Where-Object { $_.CPU -gt 10 -and $_.Name -like "pw*" }

# Simplified syntax (single condition only, PS 3+)
Get-Process | Where-Object CPU -gt 10
```

## Compare-Object

```powershell
Compare-Object @(1,2,3,4) @(2,3,4,5)
# 1 <=  (only in left)
# 5 =>  (only in right)

# For complex objects, compare by property (default uses reference equality)
Compare-Object $old $new -Property Name, Email
```

## `.ForEach()` and `.Where()` Methods (PS 4+)

```powershell
(1..5).ForEach({ $_ * 2 })              # @(2,4,6,8,10)
@("1","2","3").ForEach([int])            # Type conversion
@("hello","world").ForEach('ToUpper')    # Method by name

# .Where() with Split mode
$big, $small = (1..10).Where({ $_ -gt 5 }, 'Split')
```

## Common Mistakes

**1. Parsing text instead of using objects:** Do not regex `Out-String` output.
Access `.Property` directly.

**2. `New-Object PSObject -Property @{}`:** Unordered. Use `[PSCustomObject]@{}`.

**3. Missing `@()` wrapper:** `Get-ChildItem` returning 1 item gives a scalar, not
an array. Wrap: `@(Get-ChildItem *.log)`.

**4. Select-Object kills original type:** `Get-Process | Select-Object Name` returns
PSCustomObject. Cannot call `.Kill()` on it.

**5. `[bool]"False"` is `$true`:** Non-empty strings are truthy. Use
`[Convert]::ToBoolean("False")`.

**6. Left-operand coercion:** `"5" + 3` is `"53"`, not `8`.

**7. `.Count` on single objects:** `$file.Count` may be `$null` (pre-PS 7.5) or 1.
Use `@($file).Count`.

**8. Hashtable in pipeline:** `@{Name="X"} | Select-Object Name` gives empty Name.
Cast to `[PSCustomObject]` first.

**9. Add-Member silent return:** `$obj | Add-Member NoteProperty X 1` returns nothing.
Use `-PassThru` if chaining.

**10. Member enumeration property collision:** `$files.Length` returns array length,
not file sizes. Use `ForEach-Object` for element properties.
