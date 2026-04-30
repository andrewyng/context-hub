# Pester 5 Assertion Reference

All assertions use `Should -Operator` syntax. Legacy v4 positional syntax is removed.

Negate any assertion with `-Not`: `$x | Should -Not -Be 5`

Add failure context with `-Because`: `$x | Should -Be 5 -Because 'config requires 5'`

## Equality

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-Be` | Case-insensitive equality (strings), value equality (numbers) | `'Hello' \| Should -Be 'hello'` |
| `-BeExactly` | Case-sensitive equality | `'Hello' \| Should -BeExactly 'Hello'` |
| `-HaveParameter` | Assert function has parameter with optional type/attributes | `Get-Command Get-Item \| Should -HaveParameter 'Path' -Type [string[]]` |

## Comparison

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-BeGreaterThan` | Greater than (`-gt`) | `10 \| Should -BeGreaterThan 5` |
| `-BeGreaterOrEqual` | Greater than or equal (`-ge`) | `10 \| Should -BeGreaterOrEqual 10` |
| `-BeLessThan` | Less than (`-lt`) | `3 \| Should -BeLessThan 5` |
| `-BeLessOrEqual` | Less than or equal (`-le`) | `3 \| Should -BeLessOrEqual 3` |
| `-BeIn` | Value is contained in expected collection | `'a' \| Should -BeIn @('a','b','c')` |

## Boolean and Null

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-BeTrue` | Value is `$true` | `$result \| Should -BeTrue` |
| `-BeFalse` | Value is `$false` | `$result \| Should -BeFalse` |
| `-BeNullOrEmpty` | Value is `$null`, empty string, or empty collection | `$null \| Should -BeNullOrEmpty` |
| `-Be $null` | Strictly null (not empty string/collection) | `$result \| Should -Be $null` |
| `-Be $true` | Truthy check via `-Be` | `$result \| Should -Be $true` |

## String Matching

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-BeLike` | Wildcard match (case-insensitive, `*`, `?`, `[]`) | `'PowerShell' \| Should -BeLike '*shell'` |
| `-BeLikeExactly` | Wildcard match (case-sensitive) | `'PowerShell' \| Should -BeLikeExactly 'Power*'` |
| `-Match` | Regex match (case-insensitive) | `'Error 404' \| Should -Match '\d{3}'` |
| `-MatchExactly` | Regex match (case-sensitive) | `'PowerShell' \| Should -MatchExactly '^Power'` |

## Collection

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-Contain` | Collection contains expected value (case-insensitive) | `@(1,2,3) \| Should -Contain 2` |
| `-HaveCount` | Collection has exact count | `@(1,2,3) \| Should -HaveCount 3` |
| `-BeIn` | Value is member of expected collection | `'b' \| Should -BeIn @('a','b','c')` |
| `-Be` (arrays) | Arrays match element-by-element | `@(1,2) \| Should -Be @(1,2)` |

### Contain vs BeIn

```
# -Contain: pipe the COLLECTION, provide the VALUE
@('a','b','c') | Should -Contain 'b'

# -BeIn: pipe the VALUE, provide the COLLECTION
'b' | Should -BeIn @('a','b','c')
```

## Type

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-BeOfType` | Value is the specified .NET type | `42 \| Should -BeOfType [int]` |
| `-BeOfType` (string) | Also accepts type name as string | `42 \| Should -BeOfType 'System.Int32'` |
| `-HaveType` | Alias for `-BeOfType` | `'hi' \| Should -HaveType [string]` |

### Common Types

```powershell
42          | Should -BeOfType [int]
42          | Should -BeOfType [int32]
3.14        | Should -BeOfType [double]
'text'      | Should -BeOfType [string]
$true       | Should -BeOfType [bool]
(Get-Date)  | Should -BeOfType [datetime]
@(1,2)      | Should -BeOfType [array]       # Fails — arrays are [object[]]
@(1,2)      | Should -BeOfType [object[]]
@{a=1}      | Should -BeOfType [hashtable]
```

## File System

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-Exist` | Path exists (file or directory) | `'/tmp/file.txt' \| Should -Exist` |
| `-FileContentMatch` | File contains line matching regex (case-insensitive) | `'/tmp/f.txt' \| Should -FileContentMatch 'error'` |
| `-FileContentMatchExactly` | File contains line matching regex (case-sensitive) | `'/tmp/f.txt' \| Should -FileContentMatchExactly 'Error'` |
| `-FileContentMatchMultiline` | Regex match across entire file content (multiline) | `'/tmp/f.txt' \| Should -FileContentMatchMultiline '(?s)start.*end'` |

### File Assertions with TestDrive

```powershell
$path = Join-Path $TestDrive 'output.log'
Set-Content $path -Value 'Level=INFO message=OK'

$path | Should -Exist
$path | Should -FileContentMatch 'Level=INFO'
$path | Should -FileContentMatch 'message=\w+'
$path | Should -Not -FileContentMatch 'ERROR'
```

## Exception

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-Throw` | ScriptBlock throws any error | `{ throw 'fail' } \| Should -Throw` |
| `-Throw 'message'` | Error message matches (substring, case-insensitive) | `{ throw 'bad input' } \| Should -Throw 'bad input'` |
| `-Throw -ExceptionType` | Thrown exception is specific .NET type | `{ throw [System.IO.FileNotFoundException]::new() } \| Should -Throw -ExceptionType ([System.IO.FileNotFoundException])` |
| `-Throw -ErrorId` | Matches the FullyQualifiedErrorId | `{ Write-Error -ErrorId 'MyErr' -ErrorAction Stop } \| Should -Throw -ErrorId 'MyErr'` |
| `-Not -Throw` | ScriptBlock does NOT throw | `{ 1 + 1 } \| Should -Not -Throw` |

### Combined Exception Matching

```powershell
{ Import-Module 'Nonexistent' -ErrorAction Stop } | Should -Throw `
    -ExceptionType ([System.IO.FileNotFoundException]) `
    -ErrorId 'Modules_ModuleNotFound,Microsoft.PowerShell.Commands.ImportModuleCommand'
```

### Throw Requires a ScriptBlock

```powershell
# WRONG — expression evaluates before Should sees it
Get-Item '/nonexistent' | Should -Throw

# CORRECT
{ Get-Item '/nonexistent' -ErrorAction Stop } | Should -Throw
```

## Invocation (Mock Verification)

| Assertion | Description | Example |
|-----------|-------------|---------|
| `Should -Invoke <cmd>` | Command was called at least once | `Should -Invoke Get-Date` |
| `-Exactly -Times N` | Command was called exactly N times | `Should -Invoke Get-Date -Exactly -Times 2` |
| `-Times N` (without -Exactly) | Command was called at least N times | `Should -Invoke Get-Date -Times 1` |
| `-ParameterFilter { }` | Only count calls matching filter | `Should -Invoke Get-Item -ParameterFilter { $Path -eq '/tmp' }` |
| `-ModuleName` | Verify mock inside a specific module | `Should -Invoke -ModuleName MyModule Get-Helper` |
| `-Scope` | Check invocations in specific scope (Describe, Context, It) | `Should -Invoke Get-Date -Scope It` |

### Invoke Examples

```powershell
Describe 'Email' {
    BeforeAll {
        Mock Send-MailMessage { }
        Mock Write-Log { }
    }

    It 'sends one email and logs twice' {
        Send-Report -To 'admin@co.com'

        Should -Invoke Send-MailMessage -Exactly -Times 1
        Should -Invoke Send-MailMessage -ParameterFilter { $To -eq 'admin@co.com' }
        Should -Invoke Write-Log -Exactly -Times 2
    }

    It 'does not send email on dry run' {
        Send-Report -To 'admin@co.com' -DryRun

        Should -Invoke Send-MailMessage -Exactly -Times 0
    }
}
```

### Scope for Invoke

```powershell
Describe 'Scoped counts' {
    BeforeAll { Mock Get-Date { } }

    It 'test 1' {
        Get-Date; Get-Date
        Should -Invoke Get-Date -Exactly -Times 2 -Scope It
    }

    It 'test 2' {
        Get-Date
        Should -Invoke Get-Date -Exactly -Times 1 -Scope It
        Should -Invoke Get-Date -Exactly -Times 3 -Scope Describe  # cumulative
    }
}
```

## Command Metadata

| Assertion | Description | Example |
|-----------|-------------|---------|
| `-HaveParameter` | Command has named parameter | `Get-Command Get-Item \| Should -HaveParameter 'Path'` |
| `-HaveParameter -Type` | Parameter is specific type | `Get-Command Get-Item \| Should -HaveParameter 'Path' -Type [string[]]` |
| `-HaveParameter -Mandatory` | Parameter is mandatory | `Get-Command Get-Item \| Should -HaveParameter 'Path' -Mandatory` |
| `-HaveParameter -DefaultValue` | Parameter has default value | `Get-Command MyFunc \| Should -HaveParameter 'Count' -DefaultValue 10` |

```powershell
Describe 'Get-Widget parameters' {
    BeforeAll { . $PSCommandPath.Replace('.Tests.ps1', '.ps1') }

    It 'has mandatory Name parameter' {
        Get-Command Get-Widget | Should -HaveParameter 'Name' -Mandatory -Type [string]
    }

    It 'has optional Count with default 10' {
        Get-Command Get-Widget | Should -HaveParameter 'Count' -Type [int] -DefaultValue 10
    }
}
```

## Quick Syntax Summary

```powershell
# Pattern
<actual> | Should [-Not] -<Operator> [<expected>] [-Because 'reason']

# Negation
$x | Should -Not -Be 5
$x | Should -Not -BeNullOrEmpty
@() | Should -Not -Contain 'missing'

# Custom failure message
$x | Should -Be 5 -Because 'default config requires exactly 5 workers'

# Throw always needs scriptblock
{ risky-operation } | Should -Throw
{ safe-operation }  | Should -Not -Throw

# Invoke is standalone (not piped)
Should -Invoke CommandName -Exactly -Times N
```
