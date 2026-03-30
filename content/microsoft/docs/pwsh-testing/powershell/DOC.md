---
name: pwsh-testing
description: "PowerShell 7.5 testing with Pester 5 — Describe/Context/It, assertions, mocking, TestDrive, configuration, and code coverage"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,pester,testing,mocking,assertions,tdd,code-coverage"
---

# PowerShell 7.5 Testing with Pester 5

## Golden Rule

Pester 5 uses `Should -Be` NOT `Should Be`. The v4 positional syntax is **REMOVED** in Pester 5.x. Every assertion MUST use `-Operator` parameter syntax.

```powershell
# WRONG (v4 — removed)          # CORRECT (v5)
$result | Should Be 42           $result | Should -Be 42
$result | Should Not Throw       { $code } | Should -Not -Throw
```

## Installation

```powershell
Install-Module Pester -Force -SkipPublisherCheck   # -SkipPublisherCheck required
Import-Module Pester -MinimumVersion 5.0
```

## Test File Convention

Files MUST end with `.Tests.ps1`. Pester discovers `*.Tests.ps1` by default.

## Test Structure

```powershell
BeforeAll {
    # Runs ONCE before all tests in this file — load code under test here
    . $PSCommandPath.Replace('.Tests.ps1', '.ps1')
}

Describe 'Get-Widget' {
    BeforeAll { $script:testData = @{ Name = 'TestWidget'; Id = 1 } }
    BeforeEach { $script:widget = Get-Widget -Id 1 }
    AfterEach { }
    AfterAll { }

    It 'returns a widget by Id' {
        $widget.Id | Should -Be 1
    }

    Context 'when widget does not exist' {
        It 'returns null for missing Id' {
            Get-Widget -Id 999 | Should -BeNullOrEmpty
        }
        It 'throws on negative Id' {
            { Get-Widget -Id -1 } | Should -Throw
        }
    }
}
```

### Lifecycle Order

```
File BeforeAll (once)
  Describe BeforeAll (once)
    Context BeforeAll (once)
      BeforeEach (per It) -> It 'test' -> AfterEach (per It)
    Context AfterAll (once)
  Describe AfterAll (once)
File AfterAll (once)
```

**BeforeAll** = runs ONCE (expensive setup). **BeforeEach** = runs per `It` (fresh state per test).

```powershell
# WRONG — shared mutable state leaks between tests
Describe 'Widget' {
    BeforeAll { $script:widget = [PSCustomObject]@{ Count = 0 } }
    It 'increments' { $widget.Count++; $widget.Count | Should -Be 1 }
    It 'still zero?' { $widget.Count | Should -Be 0 }  # FAILS — Count is 1
}

# CORRECT — BeforeEach resets per test
Describe 'Widget' {
    BeforeEach { $script:widget = [PSCustomObject]@{ Count = 0 } }
    It 'increments' { $widget.Count++; $widget.Count | Should -Be 1 }
    It 'still zero' { $widget.Count | Should -Be 0 }   # Passes
}
```

## Assertions

### Equality and Comparison
```powershell
42 | Should -Be 42                      # Case-insensitive equality
'Hello' | Should -Be 'hello'            # Passes
'Hello' | Should -BeExactly 'Hello'     # Case-sensitive
10 | Should -BeGreaterThan 5
10 | Should -BeGreaterOrEqual 10
3  | Should -BeLessThan 5
3  | Should -BeLessOrEqual 3
```

### Boolean and Null
```powershell
$true  | Should -BeTrue
$false | Should -BeFalse
$null  | Should -BeNullOrEmpty
''     | Should -BeNullOrEmpty
@()    | Should -BeNullOrEmpty
'text' | Should -Not -BeNullOrEmpty
```

### String Matching
```powershell
'PowerShell' | Should -BeLike '*Shell'          # Wildcard (case-insensitive)
'PowerShell' | Should -Match 'Power\w+'         # Regex (case-insensitive)
'PowerShell' | Should -MatchExactly '^Power'    # Regex (case-sensitive)
```

### Collections
```powershell
@(1, 2, 3) | Should -Contain 2       # Collection contains value
@(1, 2, 3) | Should -HaveCount 3     # Exact count
'a' | Should -BeIn @('a','b','c')    # Value in collection
```

### Type, Exceptions, File System
```powershell
42 | Should -BeOfType [int]
{ throw 'bad' } | Should -Throw
{ throw 'bad' } | Should -Throw 'bad'
{ throw 'bad' } | Should -Throw -ExceptionType ([System.ArgumentException])
{ 1 + 1 } | Should -Not -Throw
'/tmp/file' | Should -Exist
'/tmp/f.txt' | Should -FileContentMatch 'pattern'
```

### Negation and Custom Messages
```powershell
'abc' | Should -Not -Be 'xyz'
$result | Should -Be 200 -Because 'API should return 200 for valid input'
```

See `references/pester-assertions.md` for the complete assertion reference.

## Mocking

Mock replaces a command within the current scope for test isolation.

```powershell
Describe 'Deploy-App' {
    BeforeAll { . $PSCommandPath.Replace('.Tests.ps1', '.ps1') }

    It 'copies files and restarts service' {
        Mock Copy-Item { }
        Mock Restart-Service { }

        Deploy-App -Name 'MyApp' -Path 'C:\Deploy'

        Should -Invoke Copy-Item -Exactly -Times 1
        Should -Invoke Restart-Service -Exactly -Times 1
    }
}
```

### Mock with Return Value
```powershell
Mock Get-Service { [PSCustomObject]@{ Status = 'Running'; Name = 'MyApp' } }
```

### Mock with ParameterFilter
```powershell
Mock Get-Content { 'prod config' } -ParameterFilter { $Path -eq '/etc/app/prod.conf' }
Mock Get-Content { 'dev config' } -ParameterFilter { $Path -eq '/etc/app/dev.conf' }
```

### Verifying Mock Calls
```powershell
Should -Invoke Get-Content -Exactly -Times 2
Should -Invoke Get-Content -Times 1 -ParameterFilter { $Path -like '*prod*' }
Should -Invoke Restart-Service -Exactly -Times 0  # Never called
```

### Mocking Internal Module Functions
```powershell
Mock -ModuleName MyModule Get-InternalHelper { return 'mocked' }
Should -Invoke -ModuleName MyModule Get-InternalHelper -Times 1
```

### Mock Scope

Mocks in `BeforeAll` apply to the containing block. Mocks in `It` apply only to that `It`.

```powershell
Describe 'Scoping' {
    Context 'with mock' {
        BeforeAll { Mock Get-Date { [datetime]'2026-01-01' } }
        It 'uses mock' { (Get-Date).Year | Should -Be 2026 }
    }
    Context 'without mock' {
        It 'uses real Get-Date' { (Get-Date).Year | Should -BeGreaterThan 2020 }
    }
}
```

## TestDrive

`$TestDrive` provides an isolated temp filesystem, cleaned between `Describe` blocks.

```powershell
Describe 'File operations' {
    It 'creates and reads a file' {
        $path = Join-Path $TestDrive 'test.txt'
        Set-Content -Path $path -Value 'hello pester'
        $path | Should -Exist
        Get-Content $path | Should -Be 'hello pester'
    }
}
```

## Parameterized Tests

### -ForEach on It
```powershell
Describe 'Math' {
    It 'adds <a> + <b> = <expected>' -ForEach @(
        @{ a = 1; b = 2; expected = 3 }
        @{ a = 0; b = 0; expected = 0 }
        @{ a = -1; b = 1; expected = 0 }
    ) {
        ($a + $b) | Should -Be $expected
    }
}
```

### -ForEach on Describe/Context
```powershell
Describe 'Config for <env>' -ForEach @(
    @{ env = 'dev'; port = 8080 }
    @{ env = 'prod'; port = 443 }
) {
    It 'returns correct port' { (Get-Config -Env $env).Port | Should -Be $port }
}
```

`-TestCases` is the legacy alias for `-ForEach` and still works.

## Running Tests

```powershell
Invoke-Pester                                            # All tests in cwd
Invoke-Pester -Path './Tests/Get-Widget.Tests.ps1'       # Specific file
Invoke-Pester -Path './Tests/' -Output Detailed          # Verbose output
Invoke-Pester -Path './Tests/' -Tag 'Unit'               # By tag
Invoke-Pester -Path './Tests/' -ExcludeTag 'Slow'        # Exclude tag
```

### Tagging Tests
```powershell
Describe 'Quick tests' -Tag 'Unit', 'Fast' { ... }
Describe 'Slow tests' -Tag 'Integration', 'Slow' {
    It 'network test' -Tag 'Network' { ... }   # It blocks can also have tags
}
```

## PesterConfiguration

```powershell
$config = New-PesterConfiguration
$config.Run.Path = './Tests'
$config.Run.ExcludePath = './Tests/Legacy'
$config.Run.PassThru = $true
$config.Output.Verbosity = 'Detailed'   # None, Normal, Detailed, Diagnostic
$config.Filter.Tag = @('Unit')
$config.Filter.ExcludeTag = @('Slow')

# Code Coverage
$config.CodeCoverage.Enabled = $true
$config.CodeCoverage.Path = @('./src/*.ps1', './src/*.psm1')
$config.CodeCoverage.OutputFormat = 'JaCoCo'
$config.CodeCoverage.OutputPath = './coverage.xml'
$config.CodeCoverage.CoveragePercentTarget = 80

# CI test results
$config.TestResult.Enabled = $true
$config.TestResult.OutputFormat = 'NUnitXml'   # or JUnitXml
$config.TestResult.OutputPath = './testResults.xml'

$result = Invoke-Pester -Configuration $config
$result.FailedCount   # Check in CI pipeline
```

## Common Mistakes

### 1. Using Pester v4 Syntax
```powershell
# WRONG: $x | Should Be 42       (v4, removed)
# CORRECT: $x | Should -Be 42    (v5, named operator)
```

### 2. Dot-Sourcing Outside BeforeAll
```powershell
# WRONG — runs at discovery time, not test time
Describe 'MyFunc' {
    . './MyFunc.ps1'             # BAD
    It 'works' { MyFunc | Should -Be 'ok' }
}
# CORRECT — BeforeAll runs at execution time
Describe 'MyFunc' {
    BeforeAll { . $PSCommandPath.Replace('.Tests.ps1', '.ps1') }
    It 'works' { MyFunc | Should -Be 'ok' }
}
```

### 3. BeforeAll vs BeforeEach Confusion
Use `BeforeAll` for shared read-only setup. Use `BeforeEach` when tests mutate state (see lifecycle section above).

### 4. Mock Defined in Wrong Scope
```powershell
# WRONG — mock in It only lasts for that It
It 'test 1' { Mock Get-Date { [datetime]'2026-01-01' }; ... }
It 'test 2' { (Get-Date).Year | Should -Be 2026 }  # FAILS — mock gone
# CORRECT — mock in BeforeAll
BeforeAll { Mock Get-Date { [datetime]'2026-01-01' } }
```

### 5. Should -Invoke Outside It Block
`Should -Invoke` MUST be inside an `It` block. Placing it in `BeforeAll` or at `Describe` level causes errors.

### 6. Forgetting -SkipPublisherCheck on Install
`Install-Module Pester -Force` fails because built-in Pester is Microsoft-signed. Always add `-SkipPublisherCheck`.

### 7. Testing Throw Without ScriptBlock
```powershell
# WRONG — error escapes before Should sees it
Get-Widget -Id -1 | Should -Throw
# CORRECT — wrap in scriptblock
{ Get-Widget -Id -1 } | Should -Throw
```

### 8. Using -Contain for String Matching
`-Contain` checks if a COLLECTION contains an element. For strings, use `-Match` or `-BeLike`.

### 9. Not Using -Exactly with Should -Invoke
`Should -Invoke Cmd -Times 1` means "at least 1". Use `-Exactly -Times 1` for exact count.
