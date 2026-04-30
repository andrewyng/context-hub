---
name: spring-data-jpa
description: "Spring Data JPA for Spring Boot 4.0.x — entities, repositories, queries, pagination, auditing, and Flyway migrations with Hibernate 7 and Spring Data 2025.1"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-data-jpa,jpa,hibernate,database,postgresql,repositories,flyway,migrations"
---

# Spring Data JPA for Spring Boot 4.0.x

## What This Covers

JPA data access with Spring Boot 4.0.x — entity mapping, repository interfaces, derived and custom queries, pagination, auditing, relationships, and database migrations with Flyway.

- Starter: `spring-boot-starter-data-jpa`
- JPA provider: Hibernate 7.x (aligned with Spring Data 2025.1)
- Jakarta Persistence: `jakarta.persistence.*` (JPA 3.2)
- Docs: `https://docs.spring.io/spring-boot/reference/data/sql.html`

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<!-- PostgreSQL driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
<!-- H2 for dev/test -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Configuration

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate
    open-in-view: false
    properties:
      hibernate:
        format_sql: true
```

Always set `open-in-view: false` to avoid lazy loading outside transactions.

## Entity Definition

```java
package com.example.myapp.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    protected Product() {} // JPA requires no-arg constructor

    public Product(String name, String description, Double price) {
        this.name = name;
        this.description = description;
        this.price = price;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
```

## Repository Interface

```java
package com.example.myapp.repository;

import com.example.myapp.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    Optional<Product> findByNameIgnoreCase(String name);

    List<Product> findByPriceBetween(Double min, Double max);

    boolean existsByNameIgnoreCase(String name);

    Page<Product> findByPriceGreaterThan(Double price, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.price > :minPrice ORDER BY p.createdAt DESC")
    List<Product> findExpensiveProducts(@Param("minPrice") Double minPrice);

    @Query(value = "SELECT * FROM products WHERE name ILIKE %:term%", nativeQuery = true)
    List<Product> searchByName(@Param("term") String term);
}
```

## Service Layer with @Transactional

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> findAll() {
        return productRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    public ProductResponse findById(Long id) {
        return productRepository.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        var product = new Product(request.name(), request.description(), request.price());
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        var product = productRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
    }

    private ProductResponse toResponse(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getDescription(), p.getPrice());
    }
}
```

## Entity Relationships

```java
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
```

## Flyway Migrations

```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

Place SQL in `src/main/resources/db/migration/`:

```sql
-- V1__create_products.sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
  jpa:
    hibernate:
      ddl-auto: validate
```

## Auditing

```java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;
}
```

Enable: `@EnableJpaAuditing` on a `@Configuration` class.

## Common Mistakes

1. **Using `FetchType.EAGER`** — always use `LAZY`, fetch with JOIN FETCH or `@EntityGraph`
2. **N+1 queries** — use `@Query("SELECT o FROM Order o JOIN FETCH o.items")`
3. **Modifying entities outside `@Transactional`** — changes silently lost
4. **Using `ddl-auto=update` in production** — use Flyway or Liquibase
5. **Missing `protected` no-arg constructor** — JPA requires it
6. **Leaving `open-in-view=true`** — hides N+1 issues

## Official Sources

- SQL Databases: `https://docs.spring.io/spring-boot/reference/data/sql.html`
- Spring Data JPA: `https://docs.spring.io/spring-data/jpa/reference/`
