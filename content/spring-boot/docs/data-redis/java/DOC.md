---
name: spring-data-redis
description: "Spring Data Redis with Spring Boot 4.0.x — RedisTemplate, repository pattern, caching, pub/sub, and session storage with Lettuce client"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-data-redis,redis,cache,session,pub-sub,lettuce"
---

# Spring Data Redis for Spring Boot 4.0.x

## What This Covers

Redis integration with Spring Boot 4.0.x — RedisTemplate, repository pattern, caching, pub/sub messaging, and session storage. Uses Lettuce as default client.

- Starter: `spring-boot-starter-data-redis`
- Client: Lettuce (default), Jedis (optional)
- Docs: `https://docs.spring.io/spring-boot/reference/data/nosql.html#data.nosql.redis`

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

## Configuration

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: ${REDIS_PASSWORD:}
      timeout: 2000ms
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 2
```

## RedisTemplate Usage

```java
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;

    public SessionService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveSession(String sessionId, UserSession session) {
        redisTemplate.opsForValue().set(
            "session:" + sessionId, session, Duration.ofMinutes(30));
    }

    public UserSession getSession(String sessionId) {
        return (UserSession) redisTemplate.opsForValue()
            .get("session:" + sessionId);
    }

    public void deleteSession(String sessionId) {
        redisTemplate.delete("session:" + sessionId);
    }
}
```

## StringRedisTemplate (for simple string values)

```java
import org.springframework.data.redis.core.StringRedisTemplate;

@Service
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String clientId, int maxRequests) {
        String key = "rate:" + clientId;
        Long count = redisTemplate.opsForValue().increment(key);
        if (count == 1) {
            redisTemplate.expire(key, Duration.ofMinutes(1));
        }
        return count <= maxRequests;
    }
}
```

## JSON Serialization Config

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        var template = new RedisTemplate<String, Object>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

## Redis as Cache Provider

See `spring-boot-caching` DOC for full caching guide. Quick setup:

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000
```

## Redis Hash Operations

```java
public void saveProduct(Product product) {
    redisTemplate.opsForHash().putAll("product:" + product.getId(), Map.of(
        "name", product.getName(),
        "price", product.getPrice().toString()
    ));
}

public Map<Object, Object> getProduct(Long id) {
    return redisTemplate.opsForHash().entries("product:" + id);
}
```

## Common Mistakes

1. **Using default JDK serialization** — produces unreadable binary; configure JSON serializer
2. **Not setting TTL on keys** — Redis memory fills up over time
3. **Not configuring connection pool** — default pool may be too small for production traffic
4. **Using Redis for primary data storage** — Redis is a cache/store, not a primary database for most use cases
5. **Ignoring Boot 4 property rename** — session Redis properties moved from `spring.session.redis.*` to `spring.session.data.redis.*`

## Official Sources

- Redis: `https://docs.spring.io/spring-boot/reference/data/nosql.html#data.nosql.redis`
- Spring Data Redis: `https://docs.spring.io/spring-data/redis/reference/`
