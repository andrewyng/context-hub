---
name: spring-cloud
description: "Spring Cloud 2025.0.x with Spring Boot 4.0.x — service discovery, config server, circuit breakers, API gateway, and OpenFeign for microservices"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-cloud,microservices,eureka,config-server,circuit-breaker,gateway,openfeign,resilience4j"
---

# Spring Cloud for Spring Boot 4.0.x

## What This Covers

Spring Cloud components for microservices built with Spring Boot 4.0.x — service discovery (Eureka), centralized configuration (Config Server), circuit breakers (Resilience4j), API Gateway, and declarative HTTP clients (OpenFeign).

- BOM: `org.springframework.cloud:spring-cloud-dependencies:2025.0.x`
- Compatible with: Spring Boot 4.0.x, Spring Framework 7.0.x
- Docs: `https://spring.io/projects/spring-cloud`

**Important:** Spring Cloud releases are aligned with Spring Boot versions. Always check the compatibility matrix at `https://spring.io/projects/spring-cloud#overview`.

## Install (BOM in Maven)

```xml
<properties>
    <spring-cloud.version>2025.0.1</spring-cloud.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## Service Discovery with Eureka

### Eureka Server

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

```yaml
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```

### Eureka Client (service registration)

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

```yaml
spring:
  application:
    name: product-service
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

No `@EnableDiscoveryClient` needed — auto-configured when the starter is on the classpath.

## Spring Cloud Config Server

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
</dependency>
```

```java
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
```

```yaml
server:
  port: 8888
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/myorg/config-repo
          default-label: main
```

### Config Client

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

```yaml
spring:
  config:
    import: "optional:configserver:http://localhost:8888"
  application:
    name: product-service
```

## Circuit Breaker with Resilience4j

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
```

```java
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.stereotype.Service;

@Service
public class ExternalService {

    private final RestClient restClient;

    public ExternalService(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("https://api.external.com").build();
    }

    @CircuitBreaker(name = "externalApi", fallbackMethod = "fallback")
    public String getData() {
        return restClient.get().uri("/data").retrieve().body(String.class);
    }

    private String fallback(Throwable t) {
        return "Fallback response";
    }
}
```

```yaml
resilience4j:
  circuitbreaker:
    instances:
      externalApi:
        sliding-window-size: 10
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
        permitted-number-of-calls-in-half-open-state: 3
```

## Spring Cloud Gateway

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/v1/products/**
          filters:
            - StripPrefix=0
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/v1/orders/**
```

Spring Cloud Gateway uses Spring WebFlux (reactive). It requires `spring-boot-starter-webflux`, not `spring-boot-starter-web`.

## OpenFeign Declarative HTTP Client

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

```java
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service")
public interface ProductClient {

    @GetMapping("/api/v1/products/{id}")
    ProductResponse getProduct(@PathVariable Long id);
}
```

Enable with `@EnableFeignClients` on a `@Configuration` or `@SpringBootApplication` class.

**Note:** For new projects, consider using Spring Boot 4's native HTTP Service Clients (`@GetExchange`, `@PostExchange`) as an alternative to OpenFeign.

## Common Mistakes

1. **Mismatched Spring Cloud / Spring Boot versions** — always check the compatibility matrix
2. **Using `spring-boot-starter-web` with Gateway** — Gateway requires WebFlux
3. **Missing the Spring Cloud BOM** — without it, version conflicts are likely
4. **Not using `lb://` prefix in Gateway URIs** — required for load-balanced routing via Eureka
5. **Forgetting `spring.config.import` for Config Client** — required since Spring Boot 2.4+

## Official Sources

- Spring Cloud: `https://spring.io/projects/spring-cloud`
- Config: `https://docs.spring.io/spring-cloud-config/reference/`
- Gateway: `https://docs.spring.io/spring-cloud-gateway/reference/`
- Circuit Breaker: `https://docs.spring.io/spring-cloud-circuitbreaker/reference/`
