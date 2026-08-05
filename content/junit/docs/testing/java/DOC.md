---
name: testing
description: "JUnit 5 and Mockito testing patterns for Spring Boot with test slicing, MockMvc, and Testcontainers"
metadata:
  languages: "java"
  versions: "5.11.4"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "junit,mockito,java,testing,spring-boot,testcontainers"
---

# JUnit 5 + Mockito + Spring Boot Testing Guide

## CRITICAL: JUnit 4 vs JUnit 5 — Do NOT Mix
| WRONG (JUnit 4) | CORRECT (JUnit 5) |
|---|---|
| `import org.junit.*` | `import org.junit.jupiter.api.*` |
| `@RunWith(...)` | `@ExtendWith(...)` |
| `@RunWith(MockitoJUnitRunner.class)` | `@ExtendWith(MockitoExtension.class)` |
| `@RunWith(SpringRunner.class)` | `@SpringBootTest` (includes it) |
| `@Before` / `@After` | `@BeforeEach` / `@AfterEach` |
| `@BeforeClass` / `@AfterClass` | `@BeforeAll` / `@AfterAll` |
| `@Ignore` | `@Disabled` |
| `@Rule` / `@ClassRule` | `@ExtendWith` + `@RegisterExtension` |
| `@MockBean` (Spring Boot < 3.4) | `@MockitoBean` (Spring Boot 3.4+) |
| `@SpyBean` (Spring Boot < 3.4) | `@MockitoSpyBean` (Spring Boot 3.4+) |

## Unit Test with Mockito

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("should create order and process payment")
    void createOrder_success() {
        // given
        CreateOrderRequest request = new CreateOrderRequest("John", "john@test.com",
            List.of(new OrderItemRequest("PROD-1", 2, BigDecimal.TEN)));

        Order savedOrder = new Order(1L, "John", BigDecimal.valueOf(20));
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        when(paymentGateway.charge(any())).thenReturn(PaymentResult.success());

        // when
        OrderDto result = orderService.create(request);

        // then
        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.customerName()).isEqualTo("John");
        verify(orderRepository).save(any(Order.class));
        verify(paymentGateway).charge(any());
    }

    @Test
    @DisplayName("should throw when order not found")
    void getOrder_notFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> orderService.findById(99L));
    }
}
```

## Mockito Essentials

### Stubbing
```java
// Return value
when(repo.findById(1L)).thenReturn(Optional.of(order));

// Throw exception
when(repo.findById(99L)).thenThrow(new RuntimeException("DB error"));

// Return argument (useful for save)
when(repo.save(any(Order.class))).thenAnswer(invocation -> {
    Order order = invocation.getArgument(0);
    order.setId(1L);
    return order;
});

// Void methods
doNothing().when(repo).delete(any());
doThrow(new RuntimeException()).when(repo).deleteById(99L);
```

### Verification
```java
verify(repo).save(any(Order.class));              // called exactly once
verify(repo, times(2)).findById(anyLong());        // called exactly twice
verify(repo, never()).delete(any());               // never called
verify(repo, atLeastOnce()).findAll();             // called at least once

// Argument capture
ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
verify(repo).save(captor.capture());
Order saved = captor.getValue();
assertThat(saved.getStatus()).isEqualTo(OrderStatus.PENDING);
```

## AssertJ (preferred over JUnit assertions)

```java
import static org.assertj.core.api.Assertions.*;

// Strings
assertThat(name).isNotBlank().startsWith("John").hasSize(8);

// Numbers
assertThat(total).isPositive().isGreaterThan(BigDecimal.ZERO);

// Collections
assertThat(orders)
    .hasSize(3)
    .extracting(Order::getStatus)
    .containsExactly(PENDING, ACTIVE, COMPLETED);

// Exceptions
assertThatThrownBy(() -> service.findById(99L))
    .isInstanceOf(ResourceNotFoundException.class)
    .hasMessageContaining("not found");

// Soft assertions (don't stop at first failure)
SoftAssertions.assertSoftly(softly -> {
    softly.assertThat(order.getId()).isEqualTo(1L);
    softly.assertThat(order.getStatus()).isEqualTo(ACTIVE);
    softly.assertThat(order.getTotal()).isPositive();
});
```

## Spring Boot Test Slices

### @WebMvcTest — Controller Layer Only
```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean  // Spring Boot 3.4+ (replaces deprecated @MockBean)
    private OrderService orderService;

    @Test
    void createOrder_returnsCreated() throws Exception {
        OrderDto response = new OrderDto(1L, "John", BigDecimal.TEN, OrderStatus.PENDING);
        when(orderService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "customerName": "John",
                        "email": "john@test.com",
                        "items": [{"productId": "P1", "quantity": 1, "price": 10}],
                        "total": 10
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.customerName").value("John"));
    }

    @Test
    void createOrder_validationFails() throws Exception {
        mockMvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"customerName": "", "email": "invalid"}
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors.customerName").exists());
    }

    @Test
    void getOrder_notFound() throws Exception {
        when(orderService.findById(99L)).thenThrow(new ResourceNotFoundException("Order", 99L));

        mockMvc.perform(get("/api/v1/orders/99"))
            .andExpect(status().isNotFound());
    }
}
```

### @MockitoBean vs @Mock
| `@Mock` | `@MockitoBean` (Boot 3.4+) |
|---|---|
| Plain Mockito | Spring context aware |
| Use with `@ExtendWith(MockitoExtension.class)` | Use with `@WebMvcTest`, `@SpringBootTest` |
| Does not replace Spring beans | Replaces bean in application context |
| Faster (no Spring context) | Slower (loads partial context) |

**Note:** `@MockBean` and `@SpyBean` are deprecated since Spring Boot 3.4. Use `@MockitoBean` and `@MockitoSpyBean` instead.

### @DataJpaTest — Repository Layer Only
```java
@DataJpaTest
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByStatus_returnsMatchingOrders() {
        Order order1 = new Order("John", BigDecimal.TEN);
        order1.setStatus(OrderStatus.ACTIVE);
        entityManager.persistAndFlush(order1);

        Order order2 = new Order("Jane", BigDecimal.ONE);
        order2.setStatus(OrderStatus.PENDING);
        entityManager.persistAndFlush(order2);

        List<Order> active = orderRepository.findByStatus(OrderStatus.ACTIVE);

        assertThat(active).hasSize(1);
        assertThat(active.get(0).getCustomerName()).isEqualTo("John");
    }
}
```

### @SpringBootTest — Full Integration Test
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void createAndGetOrder() {
        CreateOrderRequest request = new CreateOrderRequest("John", "john@test.com",
            List.of(new OrderItemRequest("P1", 1, BigDecimal.TEN)), BigDecimal.TEN);

        ResponseEntity<OrderDto> createResponse = restTemplate
            .postForEntity("/api/v1/orders", request, OrderDto.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);

        Long orderId = createResponse.getBody().id();
        ResponseEntity<OrderDto> getResponse = restTemplate
            .getForEntity("/api/v1/orders/" + orderId, OrderDto.class);

        assertThat(getResponse.getBody().customerName()).isEqualTo("John");
    }
}
```

## Test Slice Summary

| Annotation | What it loads | Speed | Use for |
|---|---|---|---|
| `@WebMvcTest` | Controllers, filters, advice | Fast | REST endpoint testing |
| `@DataJpaTest` | JPA repos, EntityManager, H2 | Fast | Repository/query testing |
| `@SpringBootTest` | Full application context | Slow | Integration tests |
| `@JsonTest` | Jackson ObjectMapper | Fast | JSON serialization |
| `@RestClientTest` | RestTemplate/WebClient | Fast | External API mocking |

## Parameterized Tests

```java
@ParameterizedTest
@ValueSource(strings = {"", " ", "  "})
void createOrder_blankName_fails(String name) {
    CreateOrderRequest request = new CreateOrderRequest(name, "a@b.com", List.of(), BigDecimal.TEN);
    assertThrows(ConstraintViolationException.class, () -> orderService.create(request));
}

@ParameterizedTest
@CsvSource({
    "PENDING, true",
    "ACTIVE, true",
    "COMPLETED, false",
    "CANCELLED, false"
})
void isCancellable(OrderStatus status, boolean expected) {
    assertThat(status.isCancellable()).isEqualTo(expected);
}

@ParameterizedTest
@MethodSource("orderProvider")
void processOrder(Order order, OrderStatus expectedStatus) {
    OrderDto result = orderService.process(order);
    assertThat(result.status()).isEqualTo(expectedStatus);
}

static Stream<Arguments> orderProvider() {
    return Stream.of(
        Arguments.of(new Order("John", BigDecimal.TEN), OrderStatus.ACTIVE),
        Arguments.of(new Order("Jane", BigDecimal.ZERO), OrderStatus.REJECTED)
    );
}
```

## Testcontainers (Integration Tests with Real DB)

```java
@SpringBootTest
@Testcontainers
class OrderRepositoryIT {

    @Container
    @ServiceConnection  // Spring Boot 3.1+ — auto-configures datasource properties
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    // NOTE: @ServiceConnection replaces @DynamicPropertySource for supported containers.
    // No need for manual property registration. Supported: PostgreSQL, MySQL, Redis,
    // Kafka, RabbitMQ, MongoDB, Elasticsearch, and more.

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void findByStatus_withRealDatabase() {
        // Tests run against real PostgreSQL
        orderRepository.save(new Order("John", BigDecimal.TEN));
        assertThat(orderRepository.findByStatus(OrderStatus.PENDING)).hasSize(1);
    }
}
```

### Testcontainers Dependency
```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
```

## Nested Tests

```java
@DisplayName("OrderService")
class OrderServiceTest {

    @Nested
    @DisplayName("when creating orders")
    class CreateOrder {

        @Test
        @DisplayName("should succeed with valid request")
        void success() { ... }

        @Test
        @DisplayName("should fail with empty items")
        void failsEmptyItems() { ... }
    }

    @Nested
    @DisplayName("when cancelling orders")
    class CancelOrder {

        @Test
        @DisplayName("should cancel pending orders")
        void cancelPending() { ... }

        @Test
        @DisplayName("should reject cancelling completed orders")
        void rejectCompleted() { ... }
    }
}
```
