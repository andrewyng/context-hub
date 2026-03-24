---
name: jpa
description: "Spring Data JPA repository patterns, query methods, pagination, specifications, and auditing"
metadata:
  languages: "java"
  versions: "3.4.3"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "spring-data,jpa,java,repository,query,pagination"
---

# Spring Data JPA Guide

## CRITICAL: Common Agent Mistakes
- Do NOT use `javax.persistence.*` — Spring Boot 3 uses `jakarta.persistence.*`
- Do NOT create manual DAO implementations — use repository interfaces
- Do NOT forget `@Transactional` on service methods that modify data
- Do NOT use `findAll()` then filter in Java — use query methods or `@Query`

## Repository Interfaces

```java
// Provides CRUD + pagination + sorting + flush + batch
public interface OrderRepository extends JpaRepository<Order, Long> {
}
```

### Repository Hierarchy
| Interface | Provides |
|---|---|
| `CrudRepository<T, ID>` | `save`, `findById`, `findAll`, `delete`, `count` |
| `ListCrudRepository<T, ID>` | Same as above but returns `List` instead of `Iterable` |
| `PagingAndSortingRepository<T, ID>` | Adds `findAll(Pageable)`, `findAll(Sort)` |
| `JpaRepository<T, ID>` | All of above + `flush`, `saveAndFlush`, `deleteInBatch` |

**Use `JpaRepository` by default** — it includes everything.

## Query Method Naming

Spring Data derives queries from method names:

```java
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByLastNameAndStatus(String lastName, Status status);

    List<User> findByAgeBetween(int min, int max);

    List<User> findByNameContainingIgnoreCase(String name);

    List<User> findByCreatedAtAfter(LocalDateTime date);

    List<User> findByStatusIn(Collection<Status> statuses);

    boolean existsByEmail(String email);

    long countByStatus(Status status);

    void deleteByStatus(Status status);

    List<User> findByDepartmentName(String departmentName);  // traverses relationships

    List<User> findTop5ByOrderByCreatedAtDesc();
}
```

### Supported Keywords
`And`, `Or`, `Between`, `LessThan`, `GreaterThan`, `Like`, `Containing`,
`StartingWith`, `EndingWith`, `In`, `NotIn`, `IsNull`, `IsNotNull`,
`OrderBy`, `Not`, `True`, `False`, `IgnoreCase`, `Before`, `After`

## @Query Annotation

### JPQL (default)
```java
@Query("SELECT u FROM User u WHERE u.department.name = :deptName AND u.status = :status")
List<User> findActiveInDepartment(@Param("deptName") String deptName,
                                   @Param("status") Status status);

@Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.id = :id")
Optional<User> findByIdWithRoles(@Param("id") Long id);
```

### Native SQL
```java
@Query(value = "SELECT * FROM users WHERE email LIKE %:domain", nativeQuery = true)
List<User> findByEmailDomain(@Param("domain") String domain);
```

### Modifying Queries
```java
@Modifying
@Transactional
@Query("UPDATE User u SET u.status = :status WHERE u.lastLoginAt < :cutoff")
int deactivateInactiveUsers(@Param("status") Status status,
                             @Param("cutoff") LocalDateTime cutoff);
```

`@Modifying` is REQUIRED for UPDATE/DELETE queries. Always pair with `@Transactional`.

## Pagination and Sorting

### Controller
```java
@GetMapping("/users")
public Page<UserDto> getUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String direction) {

    Sort sort = Sort.by(Sort.Direction.fromString(direction), sortBy);
    Pageable pageable = PageRequest.of(page, size, sort);
    return userRepository.findByStatus(Status.ACTIVE, pageable).map(UserDto::from);
}
```

### Repository
```java
Page<User> findByStatus(Status status, Pageable pageable);

Slice<User> findByDepartment(Department dept, Pageable pageable);  // no COUNT query
```

**`Page`** = includes total count (extra COUNT query).
**`Slice`** = no total count, just knows if next page exists. Better for large datasets.

## N+1 Problem and Solutions

### The Problem
```java
// This triggers N+1: 1 query for orders + N queries for each order's items
List<Order> orders = orderRepository.findAll();
orders.forEach(order -> order.getItems().size());  // lazy load triggers N queries
```

### Solution 1: JOIN FETCH in @Query
```java
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")
List<Order> findByStatusWithItems(@Param("status") OrderStatus status);
```

### Solution 2: @EntityGraph
```java
@EntityGraph(attributePaths = {"items", "customer"})
List<Order> findByStatus(OrderStatus status);

// Named entity graph
@EntityGraph(value = "Order.withItemsAndCustomer")
Optional<Order> findById(Long id);
```

### Solution 3: @BatchSize (on entity)
```java
@Entity
public class Order {
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    @BatchSize(size = 25)  // loads items in batches of 25 instead of 1-by-1
    private List<OrderItem> items;
}
```

## @Transactional

```java
@Service
@Transactional(readOnly = true)  // default for all methods in this class
public class OrderService {

    @Transactional  // overrides class-level: readOnly = false
    public Order createOrder(OrderRequest request) {
        Order order = new Order(request);
        return orderRepository.save(order);
    }

    public Order getOrder(Long id) {  // uses class-level readOnly = true
        return orderRepository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException(id));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAuditEvent(AuditEvent event) {
        auditRepository.save(event);  // committed independently
    }
}
```

### Common @Transactional Mistakes
1. **Calling `@Transactional` method from same class** — proxy is bypassed, transaction not created
2. **Missing `@Transactional` on delete/update** — changes not flushed
3. **Using on private methods** — Spring proxies can't intercept private methods
4. **Not using `readOnly = true`** for read operations — misses Hibernate optimizations

## Auditing

```java
@Configuration
@EnableJpaAuditing
public class JpaConfig {}

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;
}

@Bean
public AuditorAware<String> auditorProvider() {
    return () -> Optional.ofNullable(SecurityContextHolder.getContext())
        .map(SecurityContext::getAuthentication)
        .map(Authentication::getName);
}
```

## Projections

### Interface-Based (read-only, efficient)
```java
public interface UserSummary {
    String getFirstName();
    String getLastName();
    String getEmail();

    @Value("#{target.firstName + ' ' + target.lastName}")
    String getFullName();
}

List<UserSummary> findByStatus(Status status);
```

### Record-Based
```java
public record UserDto(String firstName, String lastName, String email) {}

@Query("SELECT new com.myapp.dto.UserDto(u.firstName, u.lastName, u.email) FROM User u WHERE u.status = :status")
List<UserDto> findUserDtos(@Param("status") Status status);
```

## Specifications (Dynamic Queries)

```java
public class UserSpecifications {

    public static Specification<User> hasStatus(Status status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<User> nameLike(String name) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")),
            "%" + name.toLowerCase() + "%");
    }
}

// Repository must extend JpaSpecificationExecutor
public interface UserRepository extends JpaRepository<User, Long>,
                                         JpaSpecificationExecutor<User> {}

// Usage — compose dynamically
Specification<User> spec = Specification.where(hasStatus(ACTIVE));
if (name != null) spec = spec.and(nameLike(name));
Page<User> users = userRepository.findAll(spec, pageable);
```
