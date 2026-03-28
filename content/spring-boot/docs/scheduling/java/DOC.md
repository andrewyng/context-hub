---
name: spring-boot-scheduling
description: "Spring Boot 4.0.x task scheduling and async execution — @Scheduled, @Async, virtual threads, cron expressions, and thread pool configuration"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-scheduling,scheduled,async,cron,virtual-threads,task-execution"
---

# Spring Boot Scheduling & Async for 4.0.x

## What This Covers

Scheduled tasks and asynchronous execution with Spring Boot 4.0.x — `@Scheduled` for cron jobs, `@Async` for non-blocking execution, virtual threads support, thread pool configuration, and error handling.

No extra starter needed — scheduling is in `spring-boot-starter`. Async also built-in.

- Docs: `https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html`

## Enable Scheduling

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class SchedulingConfig {
}
```

## @Scheduled Methods

```java
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {

    // Fixed rate: every 5 seconds regardless of previous execution time
    @Scheduled(fixedRate = 5000)
    public void pollExternalApi() {
        // runs every 5 seconds
    }

    // Fixed delay: 5 seconds AFTER previous execution completes
    @Scheduled(fixedDelay = 5000)
    public void processQueue() {
        // waits for completion + 5 seconds
    }

    // Initial delay + fixed rate
    @Scheduled(initialDelay = 10000, fixedRate = 60000)
    public void warmUpCache() {
        // starts after 10s, then every 60s
    }

    // Cron expression: every day at 2:00 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void dailyCleanup() {
        // runs daily at 2 AM
    }

    // Cron with timezone
    @Scheduled(cron = "0 0 9 * * MON-FRI", zone = "Europe/Rome")
    public void weekdayReport() {
        // runs at 9 AM Rome time, Monday to Friday
    }

    // Externalized cron from application.yml
    @Scheduled(cron = "${app.scheduling.cleanup-cron}")
    public void configurableTask() {
        // cron expression from config
    }
}
```

### Cron Expression Reference

```
┌───────── second (0-59)
│ ┌───────── minute (0-59)
│ │ ┌───────── hour (0-23)
│ │ │ ┌───────── day of month (1-31)
│ │ │ │ ┌───────── month (1-12 or JAN-DEC)
│ │ │ │ │ ┌───────── day of week (0-7 or MON-SUN, 0 and 7 = Sunday)
│ │ │ │ │ │
* * * * * *
```

Examples: `0 */15 * * * *` (every 15 min), `0 0 0 1 * *` (1st of month at midnight), `0 0 */4 * * *` (every 4 hours).

## Configuration

```yaml
spring:
  task:
    scheduling:
      pool:
        size: 5  # number of threads for @Scheduled tasks
      thread-name-prefix: sched-
    execution:
      pool:
        core-size: 8
        max-size: 16
        queue-capacity: 100
      thread-name-prefix: async-

app:
  scheduling:
    cleanup-cron: "0 0 3 * * *"
```

## @Async for Asynchronous Execution

### Enable

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig {
}
```

### Usage

```java
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.concurrent.CompletableFuture;

@Service
public class NotificationService {

    // Fire-and-forget
    @Async
    public void sendEmailAsync(String to, String subject, String body) {
        // runs in a separate thread, caller doesn't wait
        emailSender.send(to, subject, body);
    }

    // Return a result asynchronously
    @Async
    public CompletableFuture<ReportResult> generateReportAsync(Long userId) {
        ReportResult result = heavyComputation(userId);
        return CompletableFuture.completedFuture(result);
    }
}
```

### Consuming async results

```java
@RestController
public class ReportController {

    private final NotificationService notificationService;

    @GetMapping("/api/v1/reports/{userId}")
    public CompletableFuture<ReportResult> getReport(@PathVariable Long userId) {
        return notificationService.generateReportAsync(userId);
    }
}
```

## Virtual Threads (Java 21+)

Spring Boot 4.0.x has full virtual thread support. Enable globally:

```yaml
spring:
  threads:
    virtual:
      enabled: true
```

This switches the auto-configured `applicationTaskExecutor`, embedded web server, and scheduling to use virtual threads. No code changes needed — `@Async` and `@Scheduled` automatically use virtual threads.

**When to use virtual threads:** I/O-bound tasks (HTTP calls, database queries, file I/O). Not beneficial for CPU-bound computation.

## Custom TaskExecutor

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

    @Bean(name = "emailExecutor")
    public Executor emailExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("email-");
        executor.initialize();
        return executor;
    }
}
```

Use with: `@Async("emailExecutor")`

**Boot 4.0 note:** The auto-configured TaskExecutor bean name is `applicationTaskExecutor` only (the `taskExecutor` alias was removed).

## Async Error Handling

```java
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return (ex, method, params) -> {
            log.error("Async error in {}: {}", method.getName(), ex.getMessage(), ex);
        };
    }
}
```

## Common Mistakes

1. **Calling `@Async` method from the same class** — Spring proxy won't intercept self-invocation; extract to a separate bean
2. **Missing `@EnableAsync` or `@EnableScheduling`** — annotations silently do nothing
3. **`@Scheduled` methods with parameters** — scheduled methods must have no arguments
4. **Not returning `void` or `CompletableFuture` from `@Async`** — other return types are silently ignored
5. **Using `fixedRate` with slow tasks** — tasks queue up; use `fixedDelay` if previous must complete first
6. **Not knowing `taskExecutor` alias was removed in Boot 4** — use `applicationTaskExecutor`
7. **Enabling virtual threads for CPU-bound work** — no benefit, may reduce throughput

## Official Sources

- Task Execution: `https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html`
