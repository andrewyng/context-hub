---
name: pwsh-strings
description: "PowerShell 7.5 string handling — interpolation, here-strings, escape characters, format operator, regex operations, and string methods"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,strings,regex,interpolation,here-strings,format"
---

# PowerShell 7.5 — Strings

What LLMs consistently get wrong about PowerShell string handling.

## Golden Rule: Backtick Is the Escape Character, Not Backslash

```powershell
# CORRECT — backtick escapes
"Hello`nWorld"          # newline
"Column1`tColumn2"      # tab
"She said `"hi`""       # escaped double quote

# WRONG — backslash does NOTHING special in PowerShell strings
"Hello\nWorld"          # literal text: Hello\nWorld
"Column1\tColumn2"      # literal text: Column1\tColumn2
```

Backslash is only special inside .NET regex patterns passed to regex operators/methods.
The PowerShell string itself is processed first, so `"\n"` is still literal `\n`.

## Expandable `""` vs Literal `''`

| Syntax | Variable Expansion | Escape Sequences |
|--------|-------------------|-----------------|
| `"double quoted"` | YES | YES (backtick) |
| `'single quoted'` | NO | NO |

```powershell
$name = "World"
"Hello $name"           # Hello World
'Hello $name'           # Hello $name (literal)

# Quoting quotes
"She said `"hello`""    # backtick escape
"She said ""hello"""    # doubled quote
'It''s here'            # doubled single quote (only way in single-quoted)
```

## Escape Characters (Only in Double-Quoted Strings)

| Sequence | Meaning | Sequence | Meaning |
|----------|---------|----------|---------|
| `` `n `` | Newline | `` `0 `` | Null |
| `` `r `` | Carriage return | `` `e `` | ESC (0x1B) |
| `` `t `` | Tab | `` `" `` | Literal `"` |
| `` `a `` | Alert/bell | ``` `` ``` | Literal backtick |
| `` `b `` | Backspace | `` `u{XXXX} `` | Unicode (PS 6+) |

None work inside single-quoted strings.

## Here-Strings — CRITICAL Syntax Rules

```powershell
# Expandable here-string
$name = "World"
$text = @"
Hello $name
"@

# Literal here-string
$text = @'
Hello $name (literal)
'@
```

**Rule 1: NOTHING after the opening tag on the same line (not even a space).**
**Rule 2: Closing tag MUST start at column 1 (no leading whitespace).**
**Rule 3: Opening `@"` must be immediately followed by a newline.**

```powershell
# WRONG — text after opening tag
$x = @"content here
"@
# ParseError!

# WRONG — closing tag is indented
function Get-Msg {
    $msg = @"
    Hello
    "@          # PARSE ERROR
}

# CORRECT — closing tag at column 1 even inside functions
function Get-Msg {
    $msg = @"
    Hello
"@
    return $msg
}
```

## Subexpression Operator `$()`

```powershell
$proc = Get-Process -Id $PID

# WRONG — only $proc is expanded, .Name is literal text
"Process: $proc.Name"            # Process: System.Diagnostics.Process (pwsh).Name

# CORRECT — $() evaluates the entire expression
"Process: $($proc.Name)"        # Process: pwsh
"Sum: $(2 + 2)"                  # Sum: 4
"Today: $(Get-Date -Format 'yyyy-MM-dd')"
"Files: $((Get-ChildItem).Count)"
```

Array in strings: `"Items: $arr"` gives space-separated output (controlled by `$OFS`).
Use `"$($arr -join ', ')"` for custom separators.

## Format Operator `-f`

```powershell
"Hello {0}, you are {1}" -f "World", "great"
"{0:N2}" -f 1234.5           # 1,234.50
"{0:X}" -f 255               # FF
"{0,-20}" -f "left"          # left-aligned, 20 chars

# Escape literal braces by doubling them
"if (x) {{result: {0}}}" -f "value"   # if (x) {result: value}
```

## Regex Operations

### `-match` — First Match Only, Populates `$Matches`

```powershell
"Hello World 123" -match '(\w+)\s+(\w+)\s+(\d+)'
$Matches[0]    # Hello World 123 (full match)
$Matches[1]    # Hello (group 1)
```

`-match` finds FIRST match only. For all matches use `[regex]::Matches()`.
`$Matches` is NOT cleared on failed match — it retains previous values.

### `-replace` — Uses REGEX, Not Literal

```powershell
"file.txt" -replace '.', '_'       # _______ (dot = any char in regex!)
"file.txt" -replace '\.', '_'      # file_txt (escaped dot)
"Price: $10" -replace '\$10', 'X'  # Price: X ($ must be escaped)
"func()" -replace '\(\)', ''       # func

# Capture groups — MUST use single quotes for replacement
"John Smith" -replace '(\w+)\s+(\w+)', '$2, $1'    # Smith, John
"John Smith" -replace '(\w+)\s+(\w+)', "$2, $1"    # WRONG: $2/$1 are PS variables
```

### `-split` — Also Regex

```powershell
"a.b.c" -split '\.'          # @('a','b','c') — escaped dot
"a.b.c" -split '.'           # splits on every char (regex dot!)
"a-b-c-d" -split '-', 3      # @('a','b','c-d') — max 3 elements
```

### `.Replace()` — Is LITERAL (Not Regex)

```powershell
"file.txt".Replace('.', '_')      # file_txt (literal dot)
"Hello".Replace('hello', 'Hi')    # Hello (case-SENSITIVE, no change)
# Case-insensitive overload:
"Hello".Replace('hello', 'Hi', [StringComparison]::OrdinalIgnoreCase)  # Hi
```

### `[regex]` for Advanced Operations

```powershell
# All matches
[regex]::Matches("abc 123 def 456", '\d+') | ForEach-Object { $_.Value }

# Named captures
$m = [regex]::Match("2026-03-30", '(?<year>\d{4})-(?<month>\d{2})')
$m.Groups['year'].Value   # 2026

# Replace with evaluator
[regex]::Replace("hello world", '\b\w', { $args[0].Value.ToUpper() })
```

## Key String Methods

```powershell
"Hello".ToUpper()                        # HELLO
"Hello".Contains("ell")                  # True (case-sensitive!)
"  x  ".Trim()                           # "x"
"Hello".Substring(1, 3)                  # ell
"Hello".IndexOf("l")                     # 2
"a,b,c".Split(",")                       # @('a','b','c') — literal split
[string]::IsNullOrWhiteSpace($var)       # True if null/empty/whitespace

# -join operator
@('a','b','c') -join ', '               # a, b, c
-join @('a','b','c')                     # abc (unary, no separator)
```

## String Comparison — Case-Insensitive by Default

```powershell
"Hello" -eq "hello"        # True (case-insensitive!)
"Hello" -ceq "hello"       # False (c prefix = case-sensitive)
# Same c/i prefix for: -ne, -like, -match, -replace, -split
```

## Common Mistakes

**1. Backslash escapes:** `"Hello\nWorld"` is literal. Use `` "Hello`nWorld" ``.

**2. Indenting here-string closing tags:** Closing `"@` must be at column 1.

**3. `-replace` is regex:** `"1.2.3" -replace '.', '-'` gives `-----`. Escape: `'\.'`
or use `.Replace('.', '-')` for literal.

**4. Double-quoting `-replace` replacements:** `"$2, $1"` expands as PS variables.
Use `'$2, $1'`.

**5. Missing `$()` for properties:** `"$user.Name"` only expands `$user`.

**6. Stale `$Matches`:** Not cleared on failed match. Always check return value first.

**7. `-split` is regex:** `"a.b.c" -split '.'` splits every char. Use `\.` or `.Split('.')`.

**8. Content after here-string opener:** `@"text` is a parse error. Must be `@"` then newline.

**9. String `+=` in loops:** O(n^2). Use `[System.Text.StringBuilder]` or `-join`.

**10. `-contains` is not substring:** `"Hello World" -contains "Hello"` is `$false`.
Use `.Contains()`, `-like "*Hello*"`, or `-match "Hello"`.
