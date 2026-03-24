---
name: rest-api
description: "Spring Boot REST controllers, request/response handling, validation, exception handling, and OpenAPI documentation"
metadata:
  languages: "java"
  versions: "3.4.3"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "spring-boot,java,rest,api,controller,validation,openapi"
---

# Spring Boot REST API Guide

## CRITICAL: Common Agent Mistakes
- Do NOT use `springfox` (Swagger) — it is **dead/abandoned**. Use `springdoc-openapi`
- Do NOT return JPA entities directly — use DTOs
- Do NOT use `@ResponseStatus` on controller methods that return `ResponseEntity`
- Do NOT forget `@Valid` on `@RequestBody` for validation to trigger
- Do NOT use `javax.validation.*` — Spring Boot 3 uses `jakarta.validation.*`

## REST Controller Basics

```java
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public Page<OrderDto> list(Pageable pageable) {
        return orderService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public OrderDto getById(@PathVariable Long id) {
        return orderService.findById(id);
    }

    @PostMapping
    public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderDto created = orderService.create(request);
        URI location = URI.create("/api/v1/orders/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public OrderDto update(@PathVariable Long id,
                           @Valid @RequestBody UpdateOrderRequest request) {
        return orderService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        orderService.delete(id);
    }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable Long id,
                                  @Valid @RequestBody UpdateStatusRequest request) {
        return orderService.updateStatus(id, request);
    }
}
```

## Request Parameters

```java
@GetMapping("/search")
public Page<OrderDto> search(
        @RequestParam(required = false) String customerName,
        @RequestParam(required = false) OrderStatus status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
    return orderService.search(customerName, status, PageRequest.of(page, size));
}

// Multiple path variables
@GetMapping("/customers/{customerId}/orders/{orderId}")
public OrderDto getCustomerOrder(@PathVariable Long customerId,
                                  @PathVariable Long orderId) {
    return orderService.findByCustomerAndId(customerId, orderId);
}

// Request headers
@PostMapping("/webhook")
public void handleWebhook(@RequestHeader("X-Signature") String signature,
                           @RequestBody String payload) {
    webhookService.process(signature, payload);
}
```

## ResponseEntity Patterns

```java
// 200 OK with body
return ResponseEntity.ok(orderDto);

// 201 Created with location header
return ResponseEntity.created(URI.create("/api/orders/" + id)).body(orderDto);

// 204 No Content
return ResponseEntity.noContent().build();

// 404 Not Found
return ResponseEntity.notFound().build();

// Custom status with headers
return ResponseEntity.status(HttpStatus.ACCEPTED)
    .header("X-Request-Id", requestId)
    .body(response);
```

## Bean Validation

### Add Dependency
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### Request DTO with Validation
```java
public record CreateOrderRequest(
    @NotBlank(message = "Customer name is required")
    String customerName,

    @NotNull(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotEmpty(message = "At least one item is required")
    @Size(max = 50, message = "Cannot exceed 50 items")
    List<@Valid OrderItemRequest> items,

    @Positive(message = "Total must be positive")
    BigDecimal total
) {}

public record OrderItemRequest(
    @NotBlank String productId,
    @Min(1) @Max(999) int quantity,
    @PositiveOrZero BigDecimal price
) {}
```

### Common Validation Annotations
| Annotation | Purpose |
|---|---|
| `@NotNull` | Not null (allows empty string) |
| `@NotBlank` | Not null, not empty, not whitespace (strings only) |
| `@NotEmpty` | Not null, not empty (strings, collections, arrays) |
| `@Size(min, max)` | String length or collection size |
| `@Min` / `@Max` | Numeric bounds |
| `@Positive` / `@PositiveOrZero` | Numeric sign |
| `@Email` | Email format |
| `@Pattern(regexp)` | Regex match |
| `@Past` / `@Future` | Date constraints |
| `@Valid` | Cascaded validation (nested objects) |

### Custom Validator
```java
@Target({FIELD})
@Retention(RUNTIME)
@Constraint(validatedBy = PhoneNumberValidator.class)
public @interface ValidPhone {
    String message() default "Invalid phone number";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class PhoneNumberValidator implements ConstraintValidator<ValidPhone, String> {
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value != null && value.matches("^\\+?[1-9]\\d{7,14}$");
    }
}
```

## Global Exception Handling

### Using ProblemDetail (RFC 7807) — Spring Boot 3.x Standard

Enable in application.yml:
```yaml
spring:
  mvc:
    problemdetails:
      enabled: true
```

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setProperty("resourceId", ex.getResourceId());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "Validation failed");
        problem.setTitle("Validation Error");

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage()));
        problem.setProperty("fieldErrors", errors);
        return problem;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleConflict(DataIntegrityViolationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT, "Data integrity violation");
        problem.setTitle("Conflict");
        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        problem.setTitle("Internal Server Error");
        return problem;
    }
}
```

### Custom Exception
```java
public class ResourceNotFoundException extends RuntimeException {
    private final String resourceId;

    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " not found with id: " + id);
        this.resourceId = String.valueOf(id);
    }

    public String getResourceId() { return resourceId; }
}
```

## File Upload/Download

```java
@PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<FileResponse> upload(@RequestParam("file") MultipartFile file) {
    if (file.isEmpty()) {
        throw new BadRequestException("File is empty");
    }
    FileResponse response = fileService.store(file);
    return ResponseEntity.ok(response);
}

@GetMapping("/download/{filename}")
public ResponseEntity<Resource> download(@PathVariable String filename) {
    Resource file = fileService.loadAsResource(filename);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + file.getFilename() + "\"")
        .body(file);
}
```

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

## OpenAPI Documentation

### CRITICAL: Use springdoc-openapi, NOT springfox
springfox is abandoned and incompatible with Spring Boot 3.

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.4</version>
</dependency>
```

Swagger UI available at: `http://localhost:8080/swagger-ui.html`
OpenAPI spec at: `http://localhost:8080/v3/api-docs`

### Configuration
```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
```

### Annotations
```java
@Operation(summary = "Create a new order",
           description = "Creates an order and returns the created resource")
@ApiResponse(responseCode = "201", description = "Order created")
@ApiResponse(responseCode = "400", description = "Invalid request")
@PostMapping
public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest request) {
    ...
}
```
