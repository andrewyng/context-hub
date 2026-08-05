---
name: spring-boot-observability
description: "Spring Boot 4.0.x observability — Micrometer metrics, OpenTelemetry tracing, structured logging, and Prometheus/Grafana integration"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-observability,micrometer,opentelemetry,tracing,metrics,structured-logging,prometheus"
---

# Spring Boot Observability for 4.0.x

## What This Covers

Observability stack for Spring Boot 4.0.x — metrics with Micrometer, distributed tracing with OpenTelemetry, structured logging (ECS, Logstash, GELF formats), and Prometheus/Grafana integration.

Boot 4.0 reorganized tracing modules: `spring-boot-micrometer-tracing` is split into `spring-boot-micrometer-tracing-brave` and `spring-boot-micrometer-tracing-opentelemetry`.

## Install (Prometheus + OpenTelemetry tracing)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
<!-- OpenTelemetry tracing -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

## Configuration

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,prometheus,metrics
  tracing:
    sampling:
      probability: 1.0  # 100% in dev, lower in prod
    export:
      opentelemetry:
        enabled: true
  opentelemetry:
    tracing:
      export:
        otlp:
          endpoint: http://localhost:4318/v1/traces
  metrics:
    distribution:
      percentiles-histogram:
        http.server.requests: true
    tags:
      application: ${spring.application.name}
```

**Boot 4.0 property rename:** tracing export properties moved from `management.{name}.tracing.export.enabled` to `management.tracing.export.{name}.enabled`.

## Structured Logging

Boot 4.0 supports structured logging natively:

```yaml
logging:
  structured:
    format:
      console: ecs  # options: ecs, logstash, gelf
```

Formats: ECS (Elastic Common Schema), Logstash JSON, GELF (Graylog Extended Log Format).

## Custom Metrics with Micrometer

```java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final Counter paymentCounter;
    private final Timer paymentTimer;

    public PaymentService(MeterRegistry registry) {
        this.paymentCounter = Counter.builder("payments.total")
            .tag("gateway", "stripe")
            .register(registry);
        this.paymentTimer = Timer.builder("payments.duration")
            .register(registry);
    }

    public PaymentResult processPayment(PaymentRequest request) {
        return paymentTimer.record(() -> {
            paymentCounter.increment();
            // ... payment logic
            return new PaymentResult("success");
        });
    }
}
```

## @Observed Annotation (declarative observability)

```java
import io.micrometer.observation.annotation.Observed;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    @Observed(name = "order.processing",
              contextualName = "processing-order",
              lowCardinalityKeyValues = {"type", "web"})
    public Order processOrder(Order order) {
        // automatically creates a span + timer
        return orderRepository.save(order);
    }
}
```

Requires `spring-boot-starter-aop` (renamed to `spring-boot-starter-aspectj` in Boot 4).

## Trace Context Propagation

Traces propagate automatically across RestClient, WebClient, Kafka, and RabbitMQ when tracing is configured. No manual propagation needed.

```java
// Trace ID automatically propagated to downstream services
public UserDto fetchUser(Long id) {
    return restClient.get()
        .uri("/users/{id}", id)
        .retrieve()
        .body(UserDto.class);
}
```

## Common Mistakes

1. **Using old tracing property paths** — Boot 4 renamed `management.{name}.tracing.export.enabled` to `management.tracing.export.{name}.enabled`
2. **Setting sampling probability to 1.0 in production** — causes massive trace volume; use 0.1 or lower
3. **Missing `micrometer-tracing-bridge-otel`** — no traces without the bridge
4. **Forgetting `spring-boot-starter-aspectj`** for `@Observed` — annotation won't be processed
5. **Not exposing prometheus endpoint** — add it to `management.endpoints.web.exposure.include`

## Official Sources

- Observability: `https://docs.spring.io/spring-boot/reference/actuator/observability.html`
- Metrics: `https://docs.spring.io/spring-boot/reference/actuator/metrics.html`
- Tracing: `https://docs.spring.io/spring-boot/reference/actuator/tracing.html`
