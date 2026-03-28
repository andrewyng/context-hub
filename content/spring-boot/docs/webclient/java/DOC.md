---
name: spring-boot-webclient
description: "Spring Boot 4.0.x WebClient and reactive HTTP — non-blocking REST calls, streaming, error handling, and WebClient vs RestClient comparison"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-webclient,webclient,reactive,webflux,http-client,non-blocking"
---

# Spring Boot WebClient for 4.0.x

## What This Covers

Reactive HTTP client with Spring Boot 4.0.x — WebClient for non-blocking REST calls, streaming responses, error handling, and when to use WebClient vs RestClient.

- Starter: `spring-boot-starter-webflux`
- Use `RestClient` for blocking calls, `WebClient` for reactive/non-blocking

## When to Use WebClient vs RestClient

- **RestClient** — blocking, synchronous calls. Use in traditional Spring MVC apps. Preferred for new blocking code.
- **WebClient** — non-blocking, reactive. Use in WebFlux apps, or when you need async/streaming in MVC apps.

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

If using in a Spring MVC app alongside `spring-boot-starter-web`, both starters can coexist — Boot will start as a Servlet (MVC) application.

## Basic Usage

```java
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;

@Service
public class UserApiClient {

    private final WebClient webClient;

    public UserApiClient(WebClient.Builder builder) {
        this.webClient = builder
            .baseUrl("https://api.example.com")
            .defaultHeader("Accept", "application/json")
            .build();
    }

    public Mono<UserDto> getUser(Long id) {
        return webClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .bodyToMono(UserDto.class);
    }

    public Flux<UserDto> getAllUsers() {
        return webClient.get()
            .uri("/users")
            .retrieve()
            .bodyToFlux(UserDto.class);
    }

    public Mono<UserDto> createUser(CreateUserRequest request) {
        return webClient.post()
            .uri("/users")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(UserDto.class);
    }
}
```

## Error Handling

```java
public Mono<UserDto> getUserWithErrorHandling(Long id) {
    return webClient.get()
        .uri("/users/{id}", id)
        .retrieve()
        .onStatus(status -> status.value() == 404,
            response -> Mono.error(new ResourceNotFoundException("User not found")))
        .onStatus(status -> status.is5xxServerError(),
            response -> Mono.error(new ExternalServiceException("API unavailable")))
        .bodyToMono(UserDto.class)
        .timeout(Duration.ofSeconds(5))
        .retry(3);
}
```

## Blocking Call from WebClient (in MVC apps)

```java
// Use .block() only in non-reactive contexts
public UserDto getUserBlocking(Long id) {
    return webClient.get()
        .uri("/users/{id}", id)
        .retrieve()
        .bodyToMono(UserDto.class)
        .block(Duration.ofSeconds(5));
}
```

**Warning:** Never call `.block()` inside a reactive pipeline or WebFlux controller — it defeats the purpose and can deadlock.

## Configuration with Timeouts

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        var httpClient = HttpClient.create()
            .responseTimeout(Duration.ofSeconds(5));

        return builder
            .baseUrl("https://api.example.com")
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    }
}
```

## Exchange with Full Response Access

```java
public Mono<UserDto> getUserWithHeaders(Long id) {
    return webClient.get()
        .uri("/users/{id}", id)
        .exchangeToMono(response -> {
            if (response.statusCode().is2xxSuccessful()) {
                return response.bodyToMono(UserDto.class);
            } else {
                return response.createError();
            }
        });
}
```

## Common Mistakes

1. **Using WebClient for simple blocking calls** — use `RestClient` instead, it's simpler and designed for it
2. **Calling `.block()` in a reactive pipeline** — causes deadlocks in WebFlux
3. **Not subscribing to Mono/Flux** — nothing happens until you subscribe or return it from a controller
4. **Missing `spring-boot-starter-webflux`** — WebClient is not in `spring-boot-starter-web`
5. **Not configuring timeouts** — default has no response timeout, calls can hang indefinitely

## Official Sources

- REST Clients: `https://docs.spring.io/spring-boot/reference/io/rest-client.html`
- WebFlux: `https://docs.spring.io/spring-boot/reference/web/reactive.html`
