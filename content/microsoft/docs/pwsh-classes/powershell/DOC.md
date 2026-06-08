---
name: pwsh-classes
description: "PowerShell 7.5 classes — class definitions, enums, constructors, properties, methods, inheritance, hidden members, and interfaces"
metadata:
  languages: "powershell"
  versions: "7.5"
  revision: 1
  updated-on: "2026-03-30"
  source: community
  tags: "powershell,pwsh,classes,enums,oop,inheritance,constructors"
---

# PowerShell 7.5 Classes

## Golden Rule

PowerShell classes are NOT C# classes:

- **No partial classes** — one class definition per type, in one file
- **Types must be defined before use** — parse order matters; referenced class must appear BEFORE the referencing class
- **Single inheritance only** — one base class, multiple interfaces (PS 7.4+)
- **No constructor chaining** like C# `this()` — use `$this.Init()` helper methods instead
- **Classes in .psm1 only** for cross-file use — `using module` does not work with `.ps1`
- **Return semantics differ** — methods emit ALL uncaptured output to the pipeline

## Class Declaration

```powershell
class ServerInfo {
    [string]$Name
    [string]$IPAddress
    [int]$Port = 443
}

$server = [ServerInfo]::new()
$server.Name = 'web01'

# Or cast from hashtable
$server = [ServerInfo]@{ Name = 'web01'; IPAddress = '10.0.0.1'; Port = 8080 }
```

## Properties

Typed with optional defaults. Validation attributes work on properties.

```powershell
class User {
    [string]$Name = 'Unknown'

    [ValidateRange(1, 65535)]
    [int]$Port

    [ValidateNotNullOrEmpty()]
    [string]$Email

    [ValidateSet('Admin', 'User', 'Guest')]
    [string]$Role = 'User'

    [Nullable[datetime]]$LastLogin
}
```

No `readonly` keyword exists. Use hidden backing field + getter method as a workaround.

## Methods

Methods MUST declare a return type. Use `[void]` for no return. Every non-void method MUST have a `return` statement.

```powershell
class Calculator {
    [int]$Value = 0
    [void] Add([int]$n) { $this.Value += $n }
    [int] GetValue() { return $this.Value }

    # Method overloading
    [string] Format() { return "Value: $($this.Value)" }
    [string] Format([string]$prefix) { return "${prefix}: $($this.Value)" }
}
```

### Critical: Suppress Pipeline Output in Methods

```powershell
# BUG — New-Item output leaks into return value
[string] CreateFile([string]$path) {
    New-Item -Path $path -ItemType File    # leaks FileInfo into return!
    return 'Done'
}

# CORRECT
[string] CreateFile([string]$path) {
    $null = New-Item -Path $path -ItemType File
    return 'Done'
}
```

## Constructors

```powershell
class DatabaseConnection {
    [string]$Server
    [string]$Database
    [int]$Port

    DatabaseConnection() {
        $this.Server = 'localhost'; $this.Database = 'master'; $this.Port = 1433
    }
    DatabaseConnection([string]$server, [string]$database) {
        $this.Server = $server; $this.Database = $database; $this.Port = 1433
    }
    DatabaseConnection([string]$server, [string]$database, [int]$port) {
        $this.Server = $server; $this.Database = $database; $this.Port = $port
    }
}

$db = [DatabaseConnection]::new('sql01', 'AppDB', 5432)
```

### No Constructor Chaining — Use Init Helper

```powershell
class Service {
    [string]$Name; [int]$Port; [bool]$UseTls

    hidden [void] Init([string]$name, [int]$port, [bool]$tls) {
        $this.Name = $name; $this.Port = $port; $this.UseTls = $tls
    }

    Service() { $this.Init('default', 80, $false) }
    Service([string]$name) { $this.Init($name, 443, $true) }
    Service([string]$name, [int]$port) { $this.Init($name, $port, $true) }
}
```

### Static Factory Methods

```powershell
class Endpoint {
    [string]$Uri
    Endpoint([string]$uri) { $this.Uri = $uri }

    static [Endpoint] FromParts([string]$host, [int]$port) {
        return [Endpoint]::new("https://${host}:${port}")
    }
}
```

## Inheritance

Single class inheritance. Base class MUST be defined before derived class in parse order.

```powershell
class Animal {
    [string]$Name; [int]$Age
    Animal([string]$name, [int]$age) { $this.Name = $name; $this.Age = $age }
    [string] Speak() { return '...' }
}

class Dog : Animal {
    [string]$Breed
    Dog([string]$name, [int]$age, [string]$breed) : base($name, $age) {
        $this.Breed = $breed
    }
    [string] Speak() { return 'Woof!' }   # Override
}

$dog = [Dog]::new('Rex', 5, 'Shepherd')
$dog -is [Animal]  # True
```

### Implementing Interfaces (PowerShell 7.4+)

```powershell
class Logger : System.IDisposable {
    hidden [System.IO.StreamWriter]$_writer

    Logger([string]$path) {
        $this._writer = [System.IO.StreamWriter]::new($path, $true)
    }
    [void] Log([string]$msg) { $this._writer.WriteLine("$(Get-Date -Format o) $msg") }
    [void] Dispose() {
        if ($this._writer) { $this._writer.Close(); $this._writer = $null }
    }
}

# Multiple interfaces
class MyType : System.IComparable, System.IDisposable {
    [int] CompareTo([object]$other) { return 0 }
    [void] Dispose() { }
}
```

## Hidden Members

`[hidden]` hides from tab-completion and `Get-Member` but does NOT make members private.

```powershell
class ApiClient {
    [string]$BaseUrl
    [hidden][string]$ApiKey
    [hidden][int]$RetryCount = 3

    [hidden][void] ValidateKey() {
        if ([string]::IsNullOrEmpty($this.ApiKey)) { throw 'API key not set' }
    }
    [void] Connect() { $this.ValidateKey() }
}

$c = [ApiClient]::new()
$c.ApiKey = 'secret'       # Still accessible!
$c | Get-Member            # ApiKey NOT shown
$c | Get-Member -Force     # ApiKey shown
```

## Enums

```powershell
enum LogLevel {
    Debug = 0; Info = 1; Warning = 2; Error = 3; Fatal = 4
}

[LogLevel]$level = [LogLevel]::Warning
[LogLevel]$level = 'Error'      # String cast works
[int][LogLevel]::Fatal           # 4
```

### Flag Enums

```powershell
[Flags()] enum FilePermission {
    None = 0; Read = 1; Write = 2; Execute = 4; All = 7
}

[FilePermission]$perms = [FilePermission]::Read -bor [FilePermission]::Write
$perms                                       # Read, Write
$perms.HasFlag([FilePermission]::Read)       # True
$perms.HasFlag([FilePermission]::Execute)    # False
```

PowerShell enums default to `[int]`. You cannot change the underlying type like in C#.

## Static Members and Methods

```powershell
class AppRegistry {
    static [hashtable]$Instances = @{}
    static [int]$Count = 0
    [string]$Name

    AppRegistry([string]$name) {
        $this.Name = $name
        [AppRegistry]::Instances[$name] = $this
        [AppRegistry]::Count++
    }

    static [AppRegistry] Get([string]$name) { return [AppRegistry]::Instances[$name] }
    static [void] Reset() { [AppRegistry]::Instances.Clear(); [AppRegistry]::Count = 0 }
}

[AppRegistry]::new('App1')
[AppRegistry]::Count       # 1
```

## Using Classes Across Files

Classes MUST be in a `.psm1` module. Use `using module` to import.

```powershell
# MyClasses.psm1
class ServerConfig { [string]$Hostname; [int]$Port = 443 }
class AppConfig : ServerConfig { [string]$AppName }
```

```powershell
# Consumer.ps1
using module './MyClasses.psm1'
$config = [ServerConfig]@{ Hostname = 'web01'; Port = 8080 }
```

Rules: `using module` MUST be the first statement in the file. Must be `.psm1` not `.ps1`. Relative paths are relative to the consuming file.

## Class-Based DSC Resources (Brief)

```powershell
[DscResource()]
class FileContent {
    [DscProperty(Key)][string]$Path
    [DscProperty(Mandatory)][string]$Content
    [DscProperty()][string]$Ensure = 'Present'

    [FileContent] Get() {
        $this.Content = if (Test-Path $this.Path) { Get-Content $this.Path -Raw } else { '' }
        return $this
    }
    [bool] Test() {
        if (-not (Test-Path $this.Path)) { return $this.Ensure -eq 'Absent' }
        return (Get-Content $this.Path -Raw) -eq $this.Content
    }
    [void] Set() {
        if ($this.Ensure -eq 'Absent') { Remove-Item $this.Path -Force }
        else { Set-Content -Path $this.Path -Value $this.Content }
    }
}
```

## Common Mistakes

### 1. Forgetting Return Type on Methods
```powershell
# WRONG — parse error
class Foo { GetName() { return 'Foo' } }
# CORRECT
class Foo { [string] GetName() { return 'Foo' } }
```

### 2. Pipeline Output Leaking into Return Values
```powershell
# WRONG — returns @( <DirectoryInfo>, 'done' )
[string] Build([string]$p) { New-Item -ItemType Directory -Path $p; return 'done' }
# CORRECT — suppress output
[string] Build([string]$p) { $null = New-Item -ItemType Directory -Path $p; return 'done' }
```

### 3. Referencing a Class Before It Is Defined
```powershell
# WRONG — Engine not yet defined when Car is parsed
class Car { [Engine]$Engine }
class Engine { [int]$Horsepower }
# CORRECT — define Engine first, then Car
```

### 4. Using `using module` with a .ps1 File
```powershell
# WRONG:  using module './MyClasses.ps1'
# CORRECT: using module './MyClasses.psm1'
```

### 5. Expecting Constructor Chaining Like C#
```powershell
# WRONG — PowerShell does not support this()
Svc([string]$n) : this($n, 80) { }   # PARSE ERROR
# CORRECT — use Init() helper method (see Constructors section above)
```

### 6. Thinking [hidden] Means Private
`[hidden]` only hides from tab-completion and `Get-Member`. Members are still directly accessible via `$obj.HiddenProp`.

### 7. Accessing Static Properties via Instance
```powershell
# WRONG — returns $null
$c = [Counter]::new(); $c.Total
# CORRECT — access on the type
[Counter]::Total
```

### 8. Using $this in Static Methods
```powershell
# WRONG — $this does not exist in static context
static [string] Format([string]$msg) { return "$($this.Prefix): $msg" }
# CORRECT — reference class name
static [string] Format([string]$msg) { return "$([Util]::Prefix): $msg" }
```

### 9. Expecting Interfaces Below PS 7.4
Interface implementation (`class Foo : IBar`) requires PowerShell 7.4+. Check `$PSVersionTable.PSVersion`.
