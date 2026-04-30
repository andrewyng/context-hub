---
name: spring-boot-validation
description: "Spring Boot 4.0.x validation — Bean Validation, custom validators, groups, cross-field validation, and @ConfigurationProperties validation"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-validation,bean-validation,hibernate-validator,custom-validator,jakarta-validation"
---

# Spring Boot Validation for 4.0.x

## What This Covers

Input validation with Spring Boot 4.0.x — Jakarta Bean Validation (Hibernate Validator), built-in constraints, custom validators, validation groups, cross-field validation, and configuration properties validation.

- Starter: `spring-boot-starter-validation`
- Uses: Jakarta Bean Validation 3.1 (`jakarta.validation.*`), Hibernate Validator
- Docs: `https://docs.spring.io/spring-boot/reference/io/validation.html`

**Do NOT use `javax.validation`** — use `jakarta.validation`.

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

Not included transitively by `spring-boot-starter-web` — you must add it explicitly.

## Built-in Constraints

```java
import jakarta.validation.constraints.*;

public record CreateUserRequest(
    @NotBlank @Size(min = 2, max = 100) String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8, max = 100) String password,
    @NotNull @Min(0) @Max(150) Integer age,
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$") String phone,
    @PastOrPresent LocalDate birthDate,
    @Positive Double salary,
    @NotEmpty List<@NotBlank String> roles
) {}
```

### Common Constraints Reference

- `@NotNull` — not null (allows empty string)
- `@NotBlank` — not null, not empty, not only whitespace (strings only)
- `@NotEmpty` — not null, not empty (strings, collections, maps, arrays)
- `@Size(min, max)` — length/size between min and max
- `@Min`, `@Max` — numeric bounds
- `@Positive`, `@Negative`, `@PositiveOrZero`, `@NegativeOrZero`
- `@Email` — valid email format
- `@Pattern(regexp)` — matches regex
- `@Past`, `@Future`, `@PastOrPresent`, `@FutureOrPresent` — date/time constraints

## Using @Valid in Controllers

```java
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest request) {
        // request is already validated here
        return ResponseEntity.created(uri).body(userService.create(request));
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable @Positive Long id,
                               @Valid @RequestBody UpdateUserRequest request) {
        return userService.update(id, request);
    }
}
```

## Error Response Handling

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        var problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation Failed");
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                e -> e.getField(),
                e -> e.getDefaultMessage() != null ? e.getDefaultMessage() : "invalid",
                (a, b) -> a + "; " + b
            ));
        problem.setProperty("errors", errors);
        return problem;
    }
}
```

## Custom Validator

```java
import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = NoProfanityValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoProfanity {
    String message() default "Contains prohibited words";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class NoProfanityValidator implements ConstraintValidator<NoProfanity, String> {

    private static final Set<String> BLOCKED = Set.of("spam", "offensive");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext ctx) {
        if (value == null) return true;
        return BLOCKED.stream().noneMatch(word ->
            value.toLowerCase().contains(word));
    }
}
```

Usage:

```java
public record CreatePostRequest(
    @NotBlank @NoProfanity String title,
    @NotBlank @Size(max = 5000) String content
) {}
```

## Validation Groups

```java
public interface OnCreate {}
public interface OnUpdate {}

public record ProductRequest(
    @Null(groups = OnCreate.class)
    @NotNull(groups = OnUpdate.class)
    Long id,

    @NotBlank(groups = {OnCreate.class, OnUpdate.class})
    String name,

    @Positive(groups = {OnCreate.class, OnUpdate.class})
    Double price
) {}
```

```java
@PostMapping
public ResponseEntity<ProductResponse> create(
        @Validated(OnCreate.class) @RequestBody ProductRequest request) { /* ... */ }

@PutMapping("/{id}")
public ProductResponse update(@PathVariable Long id,
        @Validated(OnUpdate.class) @RequestBody ProductRequest request) { /* ... */ }
```

Use `@Validated` (Spring) instead of `@Valid` (Jakarta) for groups.

## @ConfigurationProperties Validation

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;

@ConfigurationProperties(prefix = "app")
@Validated
public record AppProperties(
    @NotBlank String name,
    @Valid DatabaseProperties database
) {
    public record DatabaseProperties(
        @NotBlank String host,
        @Positive int port
    ) {}
}
```

In Boot 4.0, validation of nested `@ConfigurationProperties` follows Bean Validation spec — use `@Valid` on nested fields for cascading validation.

## Service Layer Validation

```java
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@Service
@Validated
public class OrderService {

    public Order getOrder(@Positive Long id) {
        // @Positive is enforced by Spring's method validation
        return orderRepository.findById(id).orElseThrow();
    }

    public Order createOrder(@Valid CreateOrderRequest request) {
        // @Valid triggers full bean validation on request
        return orderRepository.save(toEntity(request));
    }
}
```

## Common Mistakes

1. **Not adding `spring-boot-starter-validation`** — `@Valid` silently does nothing without it
2. **Using `javax.validation`** — must use `jakarta.validation` in Boot 4
3. **Using `@Valid` for validation groups** — use `@Validated(Group.class)` instead
4. **Missing `@Valid` on nested objects** — validation doesn't cascade without it (especially in Boot 4 `@ConfigurationProperties`)
5. **Confusing `@NotNull` with `@NotBlank`** — `@NotNull` allows empty strings, `@NotBlank` does not

## Official Sources

- Validation: `https://docs.spring.io/spring-boot/reference/io/validation.html`
