---
name: pwsh-files-data
description: "PowerShell 7.5 file I/O and data formats — Get-Content, Set-Content, encoding, CSV, JSON, XML, and data conversion cmdlets"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,files,csv,json,xml,encoding,get-content,data"
---

# PowerShell 7.5 — File I/O and Data Formats

## Golden Rule

**`Get-Content` returns an ARRAY OF LINES by default, not a single string.**

```powershell
# WRONG — $text is System.Object[] (array of strings), not one string
$text = Get-Content ./config.json
$obj = $text | ConvertFrom-Json   # Works by accident (pipeline joins) but is fragile

# RIGHT — $text is a single System.String
$text = Get-Content ./config.json -Raw
$obj = $text | ConvertFrom-Json
```

Single-line files return `[string]`, multi-line files return `[string[]]`. This
polymorphism silently breaks `.Length`, indexing, and type checks. Always use `-Raw`
when you need the whole file as one string.

---

## Get-Content Parameters

| Parameter | Purpose |
|-----------|---------|
| `-Raw` | Return entire file as one string (preserves internal newlines) |
| `-TotalCount` (`-Head`, `-First`) | Read only first N lines (efficient, stops early) |
| `-Tail` (`-Last`) | Read only last N lines (efficient, seeks from end) |
| `-ReadCount` | Lines sent through pipeline at a time (perf tuning) |
| `-Encoding` | File encoding (default: UTF-8 in PS 7) |
| `-Wait` | Output new lines as appended (like `tail -f`). Does NOT work with `-Raw` |
| `-AsByteStream` | Read as raw `[byte[]]`. Replaces PS 5.1's `-Encoding Byte` |
| `-Delimiter` | Split on this string instead of newlines |

```powershell
# -ReadCount 0 sends ALL lines as one array — different from -Raw
Get-Content bigfile.txt -ReadCount 0   # [string[]] — one array in pipeline
Get-Content bigfile.txt -Raw           # [string] — one string in pipeline

# -AsByteStream replaces PS 5.1's -Encoding Byte (removed in PS 7)
Get-Content file.bin -Encoding Byte    # WRONG — error in PS 7
Get-Content file.bin -AsByteStream     # RIGHT
```

---

## Set-Content vs Add-Content vs Out-File

| Cmdlet | Encoding (PS 7) | Writes | Appends? |
|--------|-----------------|--------|----------|
| `Set-Content` | UTF-8 NoBOM | `.ToString()` of each object | No |
| `Add-Content` | UTF-8 NoBOM | `.ToString()` of each object | Yes |
| `Out-File` / `>` | UTF-8 NoBOM | Formatted display output (like console) | No (`>>` appends) |

```powershell
$procs = Get-Process | Select-Object -First 3

# Out-File writes the FORMATTED TABLE (human-readable)
$procs | Out-File procs.txt

# Set-Content writes .ToString() — "System.Diagnostics.Process (pwsh)"
$procs | Set-Content procs.txt    # NOT what you want for display

# For structured data, convert explicitly first
$procs | ConvertTo-Csv | Set-Content procs.csv

# Out-File truncates at console width by default — use -Width to override
Get-Process | Out-File procs.txt -Width 300
# The > operator uses Out-File but has no way to set -Width
```

---

## Encoding in PowerShell 7.5

PS 7 defaults to **UTF-8 NoBOM** everywhere. This is a major change from PS 5.1.

| Cmdlet | PS 5.1 Default | PS 7.5 Default |
|--------|----------------|----------------|
| `Set-Content` | ASCII (lossy!) | UTF-8 NoBOM |
| `Add-Content` | ASCII | UTF-8 NoBOM |
| `Out-File` / `>` | UTF-16 LE (BOM) | UTF-8 NoBOM |
| `Export-Csv` | ASCII | UTF-8 NoBOM |
| `Export-Clixml` | UTF-8 BOM | UTF-8 NoBOM |

```powershell
# PS 7 -Encoding values:
-Encoding utf8         # UTF-8 no BOM (same as default)
-Encoding utf8BOM      # UTF-8 WITH BOM
-Encoding utf8NoBOM    # UTF-8 no BOM (explicit)
-Encoding ascii        # ASCII (7-bit, lossy)
-Encoding unicode      # UTF-16 LE with BOM

# WRONG — utf7 is removed in PS 7
-Encoding utf7

# BOM pitfall: Linux tools choke on BOM bytes (bash, JSON parsers)
# Use utf8BOM only when needed (e.g., Excel CSV compatibility)
$data | Export-Csv output.csv -Encoding utf8BOM
```

---

## JSON Handling

### ConvertTo-Json — The -Depth Trap

**Default `-Depth` is 2.** Anything deeper is silently replaced with the type name string.

```powershell
$obj = @{ L1 = @{ L2 = @{ L3 = @{ value = "lost" } } } }

$obj | ConvertTo-Json
# L3 becomes "System.Collections.Hashtable" — SILENT DATA LOSS

$obj | ConvertTo-Json -Depth 10    # RIGHT — preserves all nesting
$obj | ConvertTo-Json -Depth 32    # Safe habit. Max is 100
```

### ConvertFrom-Json

```powershell
# Returns [PSCustomObject] by default
$obj = '{"a":1}' | ConvertFrom-Json

# -AsHashtable returns [hashtable] — needed for key checks
$ht = '{"a":1}' | ConvertFrom-Json -AsHashtable
$ht.ContainsKey('a')     # True

# PSCustomObject has NO .ContainsKey() or .Keys
$obj.ContainsKey('a')    # ERROR
# Check PSCustomObject properties with:
$null -ne $obj.PSObject.Properties['a']
```

### JSON Round-Trip and Edge Cases

```powershell
# Correct round-trip
$config = Get-Content ./config.json -Raw | ConvertFrom-Json
$config | ConvertTo-Json -Depth 10 | Set-Content ./config.json

# Array gotcha — pipeline unrolls arrays
1, 2, 3 | ConvertTo-Json         # Three separate JSON values, NOT an array
ConvertTo-Json -InputObject @(1, 2, 3)   # [1,2,3] — correct

# -Compress removes whitespace
$obj | ConvertTo-Json -Depth 10 -Compress
```

---

## CSV Handling

```powershell
# Import — returns array of PSCustomObject
$users = Import-Csv ./users.csv
$users[0].Name                    # Property access by header name

# Custom delimiter and manual headers
$data = Import-Csv ./data.tsv -Delimiter "`t"
$data = Import-Csv ./noheader.csv -Header 'Col1', 'Col2', 'Col3'

# Export — -NoTypeInformation is REMOVED in PS 7 (now default behavior)
$users | Export-Csv ./output.csv                       # RIGHT in PS 7
$users | Export-Csv ./output.csv -NoTypeInformation    # ERROR in PS 7

# -UseQuotes (PS 7+ only)
$data | Export-Csv out.csv -UseQuotes AsNeeded    # Quote only when needed
$data | Export-Csv out.csv -UseQuotes Always      # Default — quote all fields
```

### CSV Type Gotcha — ALL Values Are Strings

```powershell
$data = Import-Csv ./numbers.csv
$data[0].Value          # "42" (string, not int)
$data[0].Value + 1      # "421" (string concatenation!)
[int]$data[0].Value + 1 # 43 (cast first)

# Always cast CSV numerics explicitly
$data | ForEach-Object { [decimal]$_.Price * [int]$_.Quantity }
```

---

## XML Handling

```powershell
# [xml] type accelerator — cast string to XmlDocument
[xml]$doc = Get-Content ./config.xml -Raw
[xml]$doc = '<root><item id="1">Hello</item></root>'
$doc.root.item          # "Hello"
$doc.root.item.id       # "1"

# GOTCHA: single child = element, multiple children = array
[xml]$doc = '<r><item>A</item></r>'
$doc.r.item             # "A" (string)
[xml]$doc = '<r><item>A</item><item>B</item></r>'
$doc.r.item             # @("A", "B") (array) — polymorphism breaks assumptions

# Select-Xml returns SelectXmlInfo, not nodes directly
$result = Select-Xml -Path ./data.xml -XPath '//item[@type="active"]'
$result.Node             # Access the actual XmlNode

# With namespace
$ns = @{ ns = 'http://example.com/schema' }
Select-Xml -Path ./data.xml -XPath '//ns:item' -Namespace $ns

# Round-trippable serialization preserving types
Get-Process | Export-Clixml ./procs.xml
$procs = Import-Clixml ./procs.xml
```

---

## Path Cmdlets — Always Use These

```powershell
# WRONG — string concat breaks cross-platform and creates double-separator bugs
$path = "$dir\$file"

# RIGHT
$path = Join-Path $dir $file
$path = Join-Path $dir 'sub' $file    # Variadic in PS 7+

# Existence checks
Test-Path ./config.json -PathType Leaf       # Must be a file
Test-Path ./config.json -PathType Container  # Must be a directory

# Path decomposition
Split-Path '/home/user/file.txt' -Parent     # /home/user
Split-Path '/home/user/file.txt' -Leaf       # file.txt
Split-Path '/home/user/file.txt' -Extension  # .txt (PS 7+)
Split-Path '/home/user/file.txt' -LeafBase   # file (PS 7+)

# Resolve to absolute (must exist)
Resolve-Path ./relative/path
```

### New-TemporaryFile and Get-FileHash

```powershell
$tmpFile = New-TemporaryFile    # Creates .tmp in system temp dir
try { <# use $tmpFile.FullName #> }
finally { Remove-Item $tmpFile.FullName -ErrorAction SilentlyContinue }

# Default algorithm is SHA256
Get-FileHash ./installer.exe
Get-FileHash ./file.txt -Algorithm MD5
Get-FileHash ./file.txt -Algorithm SHA512

# Hash a stream
$stream = [IO.MemoryStream]::new([Text.Encoding]::UTF8.GetBytes("hello"))
Get-FileHash -InputStream $stream -Algorithm SHA256
```

---

## Common Mistakes LLMs Make

### 1. Forgetting -Raw with ConvertFrom-Json
```powershell
Get-Content file.json | ConvertFrom-Json      # WRONG — fragile
Get-Content file.json -Raw | ConvertFrom-Json  # RIGHT
```

### 2. Ignoring ConvertTo-Json -Depth (default 2 silently truncates)
```powershell
$complex | ConvertTo-Json | Set-Content out.json              # WRONG
$complex | ConvertTo-Json -Depth 10 | Set-Content out.json    # RIGHT
```

### 3. Using -NoTypeInformation in PS 7 (parameter removed)
```powershell
$data | Export-Csv out.csv -NoTypeInformation  # ERROR in PS 7
$data | Export-Csv out.csv                     # RIGHT
```

### 4. Assuming CSV values are typed (all values are strings)
```powershell
$row.Amount + 1          # "1001" string concat if Amount is "100"
[int]$row.Amount + 1     # 101 — cast first
```

### 5. Using -Encoding Byte in PS 7 (removed, use -AsByteStream)
```powershell
Get-Content file.bin -Encoding Byte      # ERROR in PS 7
Get-Content file.bin -AsByteStream       # RIGHT
```

### 6. Using Set-Content for formatted output (writes type names)
```powershell
Get-Process | Set-Content procs.txt      # Writes "System.Diagnostics.Process (pwsh)"
Get-Process | Out-File procs.txt         # RIGHT — formatted table
```

### 7. String manipulation for paths (breaks cross-platform)
```powershell
$folder + "\" + $filename                  # WRONG
Join-Path $folder $filename                # RIGHT
$path.Substring(0, $path.LastIndexOf('\')) # WRONG
Split-Path $path -Parent                   # RIGHT
```

### 8. Treating Get-Content output as a single string
```powershell
$content = Get-Content ./file.txt
$content.Length    # LINE COUNT, not character count
$content = Get-Content ./file.txt -Raw
$content.Length    # Character count — correct
```

### 9. Writing JSON with > operator (may truncate at console width)
```powershell
$obj | ConvertTo-Json > out.json                             # WRONG
$obj | ConvertTo-Json -Depth 10 | Set-Content out.json       # RIGHT
```

### 10. Not using -AsHashtable for key lookups on JSON
```powershell
$cfg = Get-Content cfg.json -Raw | ConvertFrom-Json
$cfg.ContainsKey('key')    # ERROR — PSCustomObject has no ContainsKey

$cfg = Get-Content cfg.json -Raw | ConvertFrom-Json -AsHashtable
$cfg.ContainsKey('key')    # Works
```
