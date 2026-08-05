---
name: spring-boot-actuator
description: "Spring Boot Actuator 4.0.x — health checks, metrics, Prometheus, info endpoint, custom endpoints, and production monitoring"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-actuator,monitoring,health-check,metrics,prometheus,production,endpoints"
---

# Spring Boot Actuator for 4.0.x

## What This Covers

Production-ready monitoring and management features — health checks, metrics, info, custom endpoints, Prometheus integration, and endpoint security.

- Starter: `spring-boot-starter-actuator`
- Docs: `https://docs.spring.io/spring-boot/reference/actuator/index.html`

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

## Configuration

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus,env,loggers
  endpoint:
    health:
      show-details: when-authorized
      show-components: when-authorized
    heapdump:
      access: unrestricted  # default is NONE in 4.0
  info:
    env:
      enabled: true
    git:
      mode: full

info:
  app:
    name: ${spring.application.name}
    version: "@project.version@"
    java:
      version: ${java.version}
```

In Boot 4.0, the heapdump endpoint defaults to `access=NONE` to prevent accidental data leaks. You must explicitly enable it.

## Key Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| `health` | `/actuator/health` | Application health status |
| `info` | `/actuator/info` | Application metadata |
| `metrics` | `/actuator/metrics` | Micrometer metrics |
| `prometheus` | `/actuator/prometheus` | Prometheus scrape endpoint |
| `env` | `/actuator/env` | Environment properties |
| `loggers` | `/actuator/loggers` | View/change log levels at runtime |
| `beans` | `/actuator/beans` | All Spring beans |
| `mappings` | `/actuator/mappings` | All @RequestMapping paths |
| `scheduledtasks` | `/actuator/scheduledtasks` | Scheduled tasks |

## Custom Health Indicator

```java
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    public DatabaseHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Health health() {
        try (var conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                return Health.up()
                    .withDetail("database", "reachable")
                    .build();
            }
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
        return Health.down().build();
    }
}
```

## Custom Endpoint

```java
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@Endpoint(id = "appstatus")
public class AppStatusEndpoint {

    @ReadOperation
    public Map<String, Object> status() {
        return Map.of(
            "status", "running",
            "uptime", ManagementFactory.getRuntimeMXBean().getUptime(),
            "activeThreads", Thread.activeCount()
        );
    }
}
```

Accessible at `/actuator/appstatus`.

## Prometheus Integration

```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus
  prometheus:
    metrics:
      export:
        enabled: true
```

Scrape endpoint: `GET /actuator/prometheus`

## Custom Metrics

```java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final Counter orderCounter;

    public OrderService(MeterRegistry registry) {
        this.orderCounter = Counter.builder("orders.placed")
            .description("Total orders placed")
            .tag("type", "web")
            .register(registry);
    }

    public Order placeOrder(Order order) {
        orderCounter.increment();
        // ... business logic
        return order;
    }
}
```

## Securing Actuator Endpoints

```java
@Bean
public SecurityFilterChain actuatorSecurity(HttpSecurity http) throws Exception {
    http
        .securityMatcher("/actuator/**")
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers("/actuator/info").permitAll()
            .requestMatchers("/actuator/**").hasRole("ADMIN")
        );
    return http.build();
}
```

## Common Mistakes

1. **Exposing all endpoints in production** — only expose what you need, especially not `heapdump`, `env`, `shutdown`
2. **Not securing sensitive endpoints** — `env` and `configprops` leak secrets
3. **Forgetting `heapdump` defaults to NONE in Boot 4** — must explicitly set access
4. **Missing `micrometer-registry-prometheus` dependency** — the `/actuator/prometheus` endpoint won't appear without it
5. **Not setting `show-details: when-authorized`** — health details visible to everyone by default

## Official Sources

- Actuator: `https://docs.spring.io/spring-boot/reference/actuator/index.html`
- Endpoints: `https://docs.spring.io/spring-boot/reference/actuator/endpoints.html`
- Metrics: `https://docs.spring.io/spring-boot/reference/actuator/metrics.html`
