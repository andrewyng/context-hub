---
name: package
description: "Spring Boot 3.4 application setup, auto-configuration, profiles, properties, and dependency injection patterns"
metadata:
  languages: "java"
  versions: "3.4.3"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "spring-boot,java,spring,auto-configuration,dependency-injection"
---

# Spring Boot 3.4 Core Guide

## CRITICAL: Common Agent Mistakes
- Do NOT use `javax.*` imports. Spring Boot 3.x uses **Jakarta EE** (`jakarta.*`)
- Do NOT use `@Autowired` on fields. Use **constructor injection**
- Do NOT use `spring-boot-starter-parent` version 2.x. Current is **3.4.x**
- Do NOT use `SpringApplication.run()` without the class argument

## Project Setup

### Maven pom.xml (minimal)
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.4.3</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### Gradle build.gradle (minimal)
```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.4.3'
    id 'io.spring.dependency-management' version '1.1.7'
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

## Application Entry Point

```java
@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

`@SpringBootApplication` combines: `@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`

## Dependency Injection

### CORRECT: Constructor Injection (preferred)
```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    // Single constructor — @Autowired is optional
    public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }
}
```

### WRONG: Field Injection (avoid)
```java
@Service
public class OrderService {
    @Autowired  // BAD — untestable, hides dependencies
    private OrderRepository orderRepository;
}
```

### Stereotype Annotations
| Annotation | Purpose |
|---|---|
| `@Component` | Generic Spring-managed bean |
| `@Service` | Business logic layer |
| `@Repository` | Data access layer (adds exception translation) |
| `@Controller` | Web MVC controller |
| `@RestController` | REST API controller (`@Controller` + `@ResponseBody`) |
| `@Configuration` | Bean definition class |

## Configuration Properties

### application.yml (preferred over .properties for nested config)
```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USER:postgres}
    password: ${DB_PASSWORD:secret}
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
```

### Type-Safe Configuration with @ConfigurationProperties
```java
@ConfigurationProperties(prefix = "app.payment")
public record PaymentProperties(
    String apiKey,
    String apiSecret,
    Duration timeout,
    int maxRetries
) {}
```

Enable in your configuration:
```java
@Configuration
@EnableConfigurationProperties(PaymentProperties.class)
public class AppConfig {}
```

Usage:
```java
@Service
public class PaymentService {
    private final PaymentProperties properties;

    public PaymentService(PaymentProperties properties) {
        this.properties = properties;
    }
}
```

### @Value (simple cases only)
```java
@Value("${app.feature.enabled:false}")
private boolean featureEnabled;
```

Use `@ConfigurationProperties` for anything beyond a single value.

## Profiles

### Profile-Specific Config Files
```
application.yml           # default (always loaded)
application-dev.yml       # loaded when profile = dev
application-prod.yml      # loaded when profile = prod
application-test.yml      # loaded when profile = test
```

### Activating Profiles
```yaml
# application.yml
spring:
  profiles:
    active: dev
```

Or via environment: `SPRING_PROFILES_ACTIVE=prod`
Or via CLI: `--spring.profiles.active=prod`

### Profile-Conditional Beans
```java
@Configuration
public class DataSourceConfig {

    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        return new EmbeddedDatabaseBuilder()
            .setType(EmbeddedDatabaseType.H2)
            .build();
    }

    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        return DataSourceBuilder.create()
            .url("jdbc:postgresql://prod-host:5432/mydb")
            .build();
    }
}
```

## Auto-Configuration

Spring Boot auto-configures beans based on classpath dependencies.

### Excluding Auto-Configuration
```java
@SpringBootApplication(exclude = {
    DataSourceAutoConfiguration.class,
    SecurityAutoConfiguration.class
})
public class MyApplication {}
```

### Custom Conditional Beans
```java
@Bean
@ConditionalOnProperty(name = "app.cache.enabled", havingValue = "true")
public CacheManager cacheManager() {
    return new ConcurrentMapCacheManager("items");
}

@Bean
@ConditionalOnMissingBean(ObjectMapper.class)
public ObjectMapper objectMapper() {
    return new ObjectMapper().findAndRegisterModules();
}
```

## Actuator

### Add Dependency
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### Expose Endpoints
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
```

### Key Endpoints
| Endpoint | Purpose |
|---|---|
| `/actuator/health` | Application health status |
| `/actuator/info` | Build info, git info |
| `/actuator/metrics` | Application metrics |
| `/actuator/prometheus` | Prometheus-format metrics |
| `/actuator/env` | Environment properties (sensitive!) |

## Common Starters

| Starter | Purpose |
|---|---|
| `spring-boot-starter-web` | REST APIs, embedded Tomcat |
| `spring-boot-starter-data-jpa` | JPA + Hibernate |
| `spring-boot-starter-security` | Spring Security |
| `spring-boot-starter-validation` | Bean Validation (JSR 380) |
| `spring-boot-starter-test` | JUnit 5, Mockito, AssertJ, MockMvc |
| `spring-boot-starter-actuator` | Production monitoring |
| `spring-boot-starter-cache` | Caching abstraction |
| `spring-boot-starter-mail` | Email sending |

## Logging

Spring Boot uses Logback by default via SLF4J.

```yaml
logging:
  level:
    root: INFO
    com.myapp: DEBUG
    org.springframework.web: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void processOrder(Order order) {
        log.info("Processing order: {}", order.getId());
    }
}
```
