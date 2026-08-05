---
name: spring-boot-caching
description: "Spring Boot 4.0.x caching with Caffeine and Redis — @Cacheable, @CacheEvict, cache configuration, and TTL management"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-caching,cache,caffeine,redis,cacheable,performance"
---

# Spring Boot Caching for 4.0.x

## What This Covers

Application-level caching with Spring Boot 4.0.x — annotation-driven caching with `@Cacheable`, Caffeine for in-memory caching, Redis for distributed caching, and cache eviction strategies.

- Starter: `spring-boot-starter-cache`
- Docs: `https://docs.spring.io/spring-boot/reference/io/caching.html`

## Install (Caffeine — in-memory)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

## Install (Redis — distributed)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

## Enable Caching

```java
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
}
```

## Caffeine Configuration

```yaml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=10m
    cache-names: products,users
```

Or programmatic configuration:

```java
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CaffeineCacheManager cacheManager() {
        var manager = new CaffeineCacheManager("products", "users");
        manager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(Duration.ofMinutes(10))
            .recordStats());
        return manager;
    }
}
```

## Redis Configuration

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000  # 10 minutes in ms
      cache-null-values: false
  data:
    redis:
      host: localhost
      port: 6379
```

## Cache Annotations

```java
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Cacheable(value = "products", key = "#id")
    public ProductResponse findById(Long id) {
        return productRepository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Cacheable(value = "products", key = "'all'")
    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    @CachePut(value = "products", key = "#result.id()")
    public ProductResponse update(Long id, UpdateProductRequest request) {
        var product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Not found: " + id));
        product.setName(request.name());
        return toResponse(productRepository.save(product));
    }

    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void clearCache() {
        // clears all entries in "products" cache
    }
}
```

## Annotation Reference

- `@Cacheable` — cache the return value; skip method if cached
- `@CachePut` — always execute method, update cache with result
- `@CacheEvict` — remove entry from cache
- `@Caching` — combine multiple cache operations
- `@CacheConfig` — class-level shared cache settings

## Conditional Caching

```java
@Cacheable(value = "products", key = "#id", condition = "#id > 0")
public ProductResponse findById(Long id) { /* ... */ }

@Cacheable(value = "products", key = "#id", unless = "#result == null")
public ProductResponse findByIdOrNull(Long id) { /* ... */ }
```

## Common Mistakes

1. **Calling cached methods from the same class** — Spring proxies don't intercept self-invocation; extract to a separate bean
2. **Not enabling caching** — `@EnableCaching` is required
3. **Using default cache without provider** — falls back to `ConcurrentHashMap` with no eviction or TTL
4. **Caching mutable objects** — cached references can be modified; use immutable records or DTOs
5. **Not evicting on writes** — stale data served after updates

## Official Sources

- Caching: `https://docs.spring.io/spring-boot/reference/io/caching.html`
