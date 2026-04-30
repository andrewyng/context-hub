---
name: spring-boot-testing
description: "Spring Boot 4.0.x testing guide — @SpringBootTest, MockMvc, RestTestClient, test slices, Testcontainers, and service layer testing with JUnit 5"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-testing,junit5,mockmvc,testcontainers,test-slices,integration-testing,rest-test-client"
---

# Spring Boot Testing for 4.0.x

## What This Covers

Testing Spring Boot 4.0.x applications — unit tests, integration tests with `@SpringBootTest`, web layer testing with `MockMvc` and `RestTestClient`, test slices, Testcontainers for database testing, and service layer testing patterns.

- Starter: `spring-boot-starter-test`
- Includes: JUnit 5, Mockito, AssertJ, Spring Test, JSONPath, Hamcrest
- New in 4.0: `RestTestClient` for testing REST endpoints

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

## Unit Testing a Service

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void findById_returnsProduct_whenExists() {
        var product = new Product("Widget", "A widget", 9.99);
        given(productRepository.findById(1L)).willReturn(Optional.of(product));

        var result = productService.findById(1L);

        assertThat(result.name()).isEqualTo("Widget");
        then(productRepository).should().findById(1L);
    }

    @Test
    void findById_throwsException_whenNotFound() {
        given(productRepository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> productService.findById(99L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("99");
    }
}
```

## Web Layer Test with @WebMvcTest

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    void findById_returns200_whenProductExists() throws Exception {
        var response = new ProductResponse(1L, "Widget", "A widget", 9.99);
        given(productService.findById(1L)).willReturn(response);

        mockMvc.perform(get("/api/v1/products/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Widget"))
            .andExpect(jsonPath("$.price").value(9.99));
    }

    @Test
    void create_returns201_withValidInput() throws Exception {
        var response = new ProductResponse(1L, "Widget", "desc", 9.99);
        given(productService.create(any())).willReturn(response);

        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "Widget", "description": "desc", "price": 9.99}
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void create_returns400_withInvalidInput() throws Exception {
        mockMvc.perform(post("/api/v1/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"name": "", "price": -1}
                    """))
            .andExpect(status().isBadRequest());
    }
}
```

## RestTestClient (new in Spring Boot 4.0.x)

`RestTestClient` provides a fluent API for testing REST endpoints, replacing the need for raw `MockMvc` in many cases:

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.client.RestTestClient;

@SpringBootTest
@AutoConfigureMockMvc
class ProductIntegrationTest {

    @Autowired
    private RestTestClient restTestClient;

    @Test
    void createAndRetrieveProduct() {
        var request = new CreateProductRequest("Widget", "desc", 9.99);

        restTestClient.post().uri("/api/v1/products")
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated()
            .expectBody(ProductResponse.class)
            .value(product -> {
                assertThat(product.name()).isEqualTo("Widget");
            });
    }
}
```

## Full Integration Test with @SpringBootTest

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ProductIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void healthEndpoint_returns200() {
        var response = restTemplate.getForEntity("/actuator/health", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
```

## JPA Test Slice with @DataJpaTest

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
class ProductRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void findByNameContainingIgnoreCase_returnsMatches() {
        entityManager.persist(new Product("Blue Widget", "desc", 9.99));
        entityManager.persist(new Product("Red Gadget", "desc", 19.99));
        entityManager.flush();

        var results = productRepository.findByNameContainingIgnoreCase("widget");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Blue Widget");
    }
}
```

## Testcontainers for Real Database Testing

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-testcontainers</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
```

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
class ProductRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17");

    @Autowired
    private ProductRepository productRepository;

    @Test
    void save_persistsProduct() {
        var product = new Product("Widget", "desc", 9.99);
        var saved = productRepository.save(product);

        assertThat(saved.getId()).isNotNull();
        assertThat(productRepository.findById(saved.getId())).isPresent();
    }
}
```

`@ServiceConnection` auto-configures the datasource URL — no manual `@DynamicPropertySource` needed.

## Test Slices Reference

- `@WebMvcTest` — controllers, filters, `@ControllerAdvice`
- `@DataJpaTest` — JPA repositories, `TestEntityManager`, rollback by default
- `@WebFluxTest` — reactive controllers
- `@JsonTest` — JSON serialization/deserialization
- `@RestClientTest` — `RestClient` testing

## Common Mistakes

1. **Using `@MockBean` in Boot 4** — use `@MockitoBean` (from `org.springframework.test.context.bean.override.mockito`)
2. **Not using `@ServiceConnection` with Testcontainers** — avoids manual property source boilerplate
3. **Using `@SpringBootTest` for unit tests** — too slow, use `@ExtendWith(MockitoExtension.class)`
4. **Missing `spring-security-test`** — needed for `@WithMockUser` with `@WebMvcTest`
5. **Not using text blocks for JSON** — Java 21+ supports `"""` multiline strings

## Official Sources

- Testing: `https://docs.spring.io/spring-boot/reference/testing/index.html`
- Testcontainers: `https://docs.spring.io/spring-boot/reference/testing/testcontainers.html`
