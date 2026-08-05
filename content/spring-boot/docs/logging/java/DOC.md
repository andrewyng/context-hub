---
name: spring-boot-logging
description: "Spring Boot 4.0.x logging — Logback configuration, structured logging (ECS/Logstash/GELF), log levels, file rotation, and MDC for request tracing"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-logging,logback,log4j2,structured-logging,slf4j,mdc"
---

# Spring Boot Logging for 4.0.x

## What This Covers

Logging configuration with Spring Boot 4.0.x — SLF4J + Logback (default), log levels, structured logging (ECS, Logstash, GELF), file output with rotation, MDC for request correlation, and Log4j2 alternative.

No extra starter needed — logging is included in every Spring Boot starter.

**Boot 4.0 change:** Default charset for Logback is now UTF-8 (aligned with Log4j2).

- Docs: `https://docs.spring.io/spring-boot/reference/features/logging.html`

## Basic Configuration

```yaml
logging:
  level:
    root: WARN
    com.example.myapp: DEBUG
    org.springframework.web: INFO
    org.springframework.security: INFO
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE  # log SQL params
```

### Log Levels (from most to least verbose)

`TRACE` → `DEBUG` → `INFO` → `WARN` → `ERROR` → `OFF`

## Using Loggers in Code

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public Order placeOrder(Order order) {
        log.info("Placing order for customer: {}", order.getCustomerId());
        log.debug("Order details: items={}, total={}", order.getItems().size(), order.getTotal());

        try {
            var saved = orderRepository.save(order);
            log.info("Order placed successfully: id={}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Failed to place order for customer {}: {}",
                order.getCustomerId(), e.getMessage(), e);
            throw e;
        }
    }
}
```

**Always use parameterized logging** (`{}` placeholders) — never string concatenation. Pass the exception as the last argument to `log.error()` for full stack trace.

## File Output with Rotation

```yaml
logging:
  file:
    name: logs/myapp.log
    max-size: 10MB
    max-history: 30
    total-size-cap: 1GB
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    console: "%d{HH:mm:ss.SSS} %clr(%-5level) %logger{36} - %msg%n"
```

## Structured Logging (new in Boot 3.4+)

Boot 4.0 supports structured logging natively — output JSON logs for log aggregation systems:

```yaml
logging:
  structured:
    format:
      console: ecs     # Elastic Common Schema
      # console: logstash  # Logstash JSON format
      # console: gelf      # Graylog Extended Log Format
      file: logstash
```

Output example (ECS format):

```json
{
  "@timestamp": "2026-03-28T10:15:30.123Z",
  "log.level": "INFO",
  "message": "Order placed successfully: id=42",
  "ecs.version": "1.2.0",
  "service.name": "myapp",
  "process.thread.name": "http-nio-8080-exec-1",
  "log.logger": "com.example.myapp.OrderService"
}
```

## MDC (Mapped Diagnostic Context) for Request Tracing

```java
import org.slf4j.MDC;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.UUID;

@Component
public class RequestIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        String requestId = request.getHeader("X-Request-ID");
        if (requestId == null) {
            requestId = UUID.randomUUID().toString().substring(0, 8);
        }
        MDC.put("requestId", requestId);
        response.setHeader("X-Request-ID", requestId);
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

Include in log pattern:

```yaml
logging:
  pattern:
    console: "%d{HH:mm:ss} [%X{requestId}] %-5level %logger{36} - %msg%n"
```

## Custom Logback Configuration

Create `src/main/resources/logback-spring.xml` for advanced config:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml"/>
    <include resource="org/springframework/boot/logging/logback/console-appender.xml"/>

    <springProfile name="prod">
        <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
            <file>logs/myapp.log</file>
            <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
                <fileNamePattern>logs/myapp-%d{yyyy-MM-dd}.%i.log.gz</fileNamePattern>
                <maxFileSize>10MB</maxFileSize>
                <maxHistory>30</maxHistory>
                <totalSizeCap>1GB</totalSizeCap>
            </rollingPolicy>
            <encoder>
                <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
            </encoder>
        </appender>

        <root level="WARN">
            <appender-ref ref="FILE"/>
        </root>
        <logger name="com.example.myapp" level="INFO"/>
    </springProfile>

    <springProfile name="dev">
        <root level="INFO">
            <appender-ref ref="CONSOLE"/>
        </root>
        <logger name="com.example.myapp" level="DEBUG"/>
    </springProfile>
</configuration>
```

Use `logback-spring.xml` (not `logback.xml`) to get Spring profile support.

## Runtime Log Level Changes via Actuator

```bash
# View current level
curl http://localhost:8080/actuator/loggers/com.example.myapp

# Change level at runtime (no restart)
curl -X POST http://localhost:8080/actuator/loggers/com.example.myapp \
  -H 'Content-Type: application/json' \
  -d '{"configuredLevel": "DEBUG"}'
```

Requires `spring-boot-starter-actuator` with `loggers` endpoint exposed.

## Using Log4j2 Instead of Logback

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```

## Common Mistakes

1. **Using `System.out.println`** — use SLF4J loggers; println is not configurable and loses context
2. **String concatenation in log calls** — use `{}` placeholders: `log.debug("id={}", id)` not `log.debug("id=" + id)`
3. **Logging sensitive data** — never log passwords, tokens, credit card numbers
4. **Using `logback.xml` instead of `logback-spring.xml`** — loses Spring profile support and env variable resolution
5. **Not clearing MDC** — leaks context between requests in thread pools
6. **Setting root level to DEBUG in production** — generates massive log volume

## Official Sources

- Logging: `https://docs.spring.io/spring-boot/reference/features/logging.html`
