---
name: package
description: "Hibernate 6.x ORM entity mapping, fetch strategies, caching, performance tuning, and migration from Hibernate 5"
metadata:
  languages: "java"
  versions: "6.6.5"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "hibernate,java,orm,jpa,entity,mapping,performance"
---

# Hibernate 6.x / JPA Guide

## CRITICAL: Migration from Hibernate 5 — Common Agent Mistakes
| WRONG (Hibernate 5 / Java EE) | CORRECT (Hibernate 6 / Jakarta EE) |
|---|---|
| `javax.persistence.*` | `jakarta.persistence.*` |
| `javax.validation.*` | `jakarta.validation.*` |
| `org.hibernate.annotations.Type` | `@JdbcTypeCode` / `@JavaType` |
| `@Type(type = "json")` | `@JdbcTypeCode(SqlTypes.JSON)` |
| `@TypeDef` | Removed — use `@JdbcTypeCode` directly |
| `hibernate.dialect` (required) | Auto-detected in Hibernate 6 (optional) |

## Entity Mapping Basics

```java
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)  // NEVER use EnumType.ORDINAL
    @Column(nullable = false)
    private OrderStatus status;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Constructors, getters, setters
    protected Order() {}  // JPA requires no-arg constructor

    public Order(String customerName, BigDecimal totalAmount) {
        this.customerName = customerName;
        this.totalAmount = totalAmount;
        this.status = OrderStatus.PENDING;
    }

    @PrePersist
    void onCreate() { this.createdAt = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate() { this.updatedAt = LocalDateTime.now(); }
}
```

## ID Generation Strategies

| Strategy | Use When | Notes |
|---|---|---|
| `IDENTITY` | MySQL/MariaDB, simple apps | Disables batch inserts |
| `SEQUENCE` | PostgreSQL, Oracle, batch inserts | **Preferred** — allows batch inserts |
| `UUID` | Distributed systems | Use `@UuidGenerator` in Hibernate 6 |
| `TABLE` | Never | Poor performance, use SEQUENCE instead |

### SEQUENCE (recommended for PostgreSQL)
```java
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
@SequenceGenerator(name = "order_seq", sequenceName = "order_seq", allocationSize = 50)
private Long id;
```

### UUID (Hibernate 6 native)
```java
@Id
@UuidGenerator
private UUID id;
```

## Relationship Mappings

### @ManyToOne (most common, owning side)
```java
@Entity
public class OrderItem {

    @ManyToOne(fetch = FetchType.LAZY)  // LAZY is not default for *ToOne — set explicitly!
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
}
```

**CRITICAL**: `@ManyToOne` and `@OneToOne` default to `FetchType.EAGER`. Always set `LAZY` explicitly.

### @OneToMany (inverse side)
```java
@Entity
public class Order {

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    // Helper methods for bidirectional consistency
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

### @ManyToMany
```java
@Entity
public class User {

    @ManyToMany
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();  // Use Set, not List for ManyToMany
}
```

**Use `Set` not `List`** for `@ManyToMany` — Hibernate generates inefficient DELETE+INSERT with List.

### @OneToOne
```java
@Entity
public class User {

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL,
              fetch = FetchType.LAZY, optional = false)
    private UserProfile profile;
}

@Entity
public class UserProfile {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @MapsId  // shares primary key with User
    private User user;
}
```

## Fetch Type Defaults

| Annotation | Default FetchType | Recommendation |
|---|---|---|
| `@OneToOne` | **EAGER** | Change to LAZY |
| `@ManyToOne` | **EAGER** | Change to LAZY |
| `@OneToMany` | LAZY | Keep LAZY |
| `@ManyToMany` | LAZY | Keep LAZY |

**Rule: Set everything to LAZY, fetch eagerly only when needed via JOIN FETCH or @EntityGraph.**

## N+1 Problem Solutions

### Problem
```java
List<Order> orders = orderRepository.findAll();  // 1 query
for (Order o : orders) {
    o.getItems().size();  // N queries (one per order)
}
```

### Solution 1: JOIN FETCH
```java
@Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")
List<Order> findWithItems(@Param("status") OrderStatus status);
```

**Note**: `DISTINCT` is required to avoid duplicate root entities with JOIN FETCH.

### Solution 2: @EntityGraph
```java
@NamedEntityGraph(name = "Order.withItems",
    attributeNodes = @NamedAttributeNode("items"))
@Entity
public class Order { ... }

// In repository:
@EntityGraph("Order.withItems")
List<Order> findByStatus(OrderStatus status);
```

### Solution 3: @BatchSize
```java
@OneToMany(mappedBy = "order")
@BatchSize(size = 25)
private List<OrderItem> items;
```

Or globally in application.yml:
```yaml
spring:
  jpa:
    properties:
      hibernate:
        default_batch_fetch_size: 25
```

## equals() and hashCode()

**Use business key or ID-based equality. Never use all fields.**

```java
@Entity
public class Order {

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Order other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();  // constant — safe for Sets with transient entities
    }
}
```

## Schema Generation (ddl-auto)

| Value | Behavior | When to Use |
|---|---|---|
| `none` | No schema management | **Production** (use Flyway/Liquibase) |
| `validate` | Validates schema matches entities | **Production** (recommended) |
| `update` | Alters tables to match entities | Development only (never production) |
| `create-drop` | Creates on startup, drops on shutdown | Testing only |

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # production
    show-sql: false
    properties:
      hibernate:
        format_sql: true
        generate_statistics: true  # enable in dev to detect N+1
```

## Second-Level Cache

```xml
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-jcache</artifactId>
</dependency>
<dependency>
    <groupId>org.ehcache</groupId>
    <artifactId>ehcache</artifactId>
    <classifier>jakarta</classifier>
</dependency>
```

```yaml
spring:
  jpa:
    properties:
      hibernate:
        cache:
          use_second_level_cache: true
          region.factory_class: jcache
      jakarta:
        cache:
          provider: org.ehcache.jsr107.EhcacheCachingProvider
```

```java
@Entity
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Country {
    // Rarely changing reference data — good cache candidate
}
```

## Common Mistakes
1. **Using `javax.persistence`** — Must use `jakarta.persistence` with Hibernate 6
2. **Not setting `@ManyToOne(fetch = LAZY)`** — defaults to EAGER, causes N+1
3. **Using `List` for `@ManyToMany`** — causes DELETE ALL + re-INSERT. Use `Set`
4. **Missing `@JoinColumn`** — Hibernate creates a join table instead of FK column
5. **Using `ddl-auto: update` in production** — use Flyway or Liquibase
6. **Missing `equals`/`hashCode`** — breaks Set operations and detached entity merging
