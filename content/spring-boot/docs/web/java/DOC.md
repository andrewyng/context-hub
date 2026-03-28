---
name: spring-web
description: "Spring Web MVC REST controllers, request/response handling, validation, exception handling, and RestClient for Spring Boot 4.0.x"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-web,rest-api,spring-mvc,controllers,validation,exception-handling,restclient"
---

# Spring Web (REST) for Spring Boot 4.0.x

## What This Covers

REST controller development with Spring Boot 4.0.x — building JSON APIs, request validation, error handling with RFC 9457 Problem Details, and calling external services with RestClient.

- Starter: `spring-boot-starter-web`
- Embedded server: Tomcat (default) or Jetty. Undertow is removed in 4.0.
- JSON: Jackson 3 (`tools.jackson.*`) auto-configured
- Validation: `spring-boot-starter-validation` (Hibernate Validator)

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## REST Controller

```java
package com.example.myapp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<ProductResponse> findAll() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(
            @Valid @RequestBody CreateProductRequest request) {
        ProductResponse created = productService.create(request);
        URI location = URI.create("/api/v1/products/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id,
                                  @Valid @RequestBody UpdateProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}
```

## Request/Response DTOs with Records

```java
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
    @NotBlank @Size(max = 255) String name,
    String description,
    @Positive double price
) {}

public record UpdateProductRequest(
    @NotBlank String name,
    String description,
    @Positive double price
) {}

public record ProductResponse(
    Long id,
    String name,
    String description,
    double price
) {}
```

## Global Exception Handling with ProblemDetail

Spring Boot 4.0.x supports RFC 9457 Problem Details natively.

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation Failed");
        var errors = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList();
        problem.setProperty("errors", errors);
        return problem;
    }
}
```

Custom exception:

```java
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

## RestClient (blocking HTTP client — replaces RestTemplate)

```java
import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;

@Service
public class ExternalApiService {

    private final RestClient restClient;

    public ExternalApiService(RestClient.Builder builder) {
        this.restClient = builder
            .baseUrl("https://api.example.com")
            .defaultHeader("Authorization", "Bearer " + token)
            .build();
    }

    public UserDto getUser(Long id) {
        return restClient.get()
            .uri("/users/{id}", id)
            .retrieve()
            .body(UserDto.class);
    }

    public UserDto createUser(CreateUserRequest request) {
        return restClient.post()
            .uri("/users")
            .body(request)
            .retrieve()
            .body(UserDto.class);
    }

    public void deleteUser(Long id) {
        restClient.delete()
            .uri("/users/{id}", id)
            .retrieve()
            .toBodilessEntity();
    }
}
```

## HTTP Service Clients (new in 4.0.x)

Spring Boot 4.0 adds auto-configuration for HTTP Service Clients:

```java
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.PostExchange;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

public interface UserClient {

    @GetExchange("/users/{id}")
    UserDto getUser(@PathVariable Long id);

    @PostExchange("/users")
    UserDto createUser(@RequestBody CreateUserRequest request);
}
```

Register as a bean:

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class ClientConfig {

    @Bean
    public UserClient userClient(RestClient.Builder builder) {
        RestClient restClient = builder.baseUrl("https://api.example.com").build();
        var factory = HttpServiceProxyFactory
            .builderFor(RestClientAdapter.create(restClient))
            .build();
        return factory.createClient(UserClient.class);
    }
}
```

## Pagination Response Pattern

```java
@GetMapping
public Page<ProductResponse> findAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String direction) {

    Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
    Pageable pageable = PageRequest.of(page, size, sort);
    return productService.findAll(pageable);
}
```

## Common Mistakes

1. **Using `RestTemplate`** — deprecated pattern, use `RestClient` for blocking calls
2. **Not adding `spring-boot-starter-validation`** — `@Valid` annotations won't work without it
3. **Returning entities directly** — always use DTOs/records to control serialization
4. **Catching exceptions in each controller** — use `@RestControllerAdvice` globally
5. **Using Jackson 2 annotations with new group IDs** — `tools.jackson` is the correct package in Boot 4
6. **Not using `ProblemDetail`** — RFC 9457 is the standard for error responses

## Official Sources

- Web MVC: `https://docs.spring.io/spring-boot/reference/web/servlet.html`
- RestClient: `https://docs.spring.io/spring-boot/reference/io/rest-client.html`
- Validation: `https://docs.spring.io/spring-boot/reference/io/validation.html`
