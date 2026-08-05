---
name: spring-data-mongodb
description: "Spring Data MongoDB with Spring Boot 4.0.x — documents, MongoRepository, queries, aggregations, and indexing"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-data-mongodb,mongodb,nosql,documents,repository"
---

# Spring Data MongoDB for Spring Boot 4.0.x

## What This Covers

MongoDB integration with Spring Boot 4.0.x — document mapping, MongoRepository, derived and custom queries, MongoTemplate, aggregations, and indexing.

- Starter: `spring-boot-starter-data-mongodb`
- Docs: `https://docs.spring.io/spring-boot/reference/data/nosql.html#data.nosql.mongodb`

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

## Configuration

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/mydb
      # or individual properties:
      # host: localhost
      # port: 27017
      # database: mydb
      # username: ${MONGO_USER}
      # password: ${MONGO_PASS}
```

## Document Definition

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.Instant;
import java.util.List;

@Document(collection = "products")
public class Product {

    @Id
    private String id;

    @Indexed
    private String name;

    private String description;

    private Double price;

    private List<String> tags;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Product() {}

    public Product(String name, String description, Double price, List<String> tags) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.tags = tags;
    }

    // getters and setters
    public String getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
```

Enable auditing: `@EnableMongoAuditing` on a `@Configuration` class.

## Repository Interface

```java
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByPriceBetween(Double min, Double max);

    List<Product> findByTagsContaining(String tag);

    @Query("{ 'price': { $gt: ?0 }, 'tags': ?1 }")
    List<Product> findExpensiveByTag(Double minPrice, String tag);

    @Query(value = "{ 'name': { $regex: ?0, $options: 'i' } }",
           sort = "{ 'price': 1 }")
    List<Product> searchByName(String regex);
}
```

## MongoTemplate for Complex Queries

```java
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Service
public class ProductSearchService {

    private final MongoTemplate mongoTemplate;

    public ProductSearchService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<Product> search(String name, Double minPrice, Double maxPrice) {
        var query = new Query();
        if (name != null) {
            query.addCriteria(Criteria.where("name").regex(name, "i"));
        }
        if (minPrice != null && maxPrice != null) {
            query.addCriteria(Criteria.where("price").gte(minPrice).lte(maxPrice));
        }
        return mongoTemplate.find(query, Product.class);
    }
}
```

## Aggregation

```java
import org.springframework.data.mongodb.core.aggregation.Aggregation;

public List<TagCount> countByTag() {
    var aggregation = Aggregation.newAggregation(
        Aggregation.unwind("tags"),
        Aggregation.group("tags").count().as("count"),
        Aggregation.sort(Sort.Direction.DESC, "count")
    );
    return mongoTemplate.aggregate(aggregation, "products", TagCount.class)
        .getMappedResults();
}

public record TagCount(String id, long count) {}
```

## Common Mistakes

1. **Using `@Entity` instead of `@Document`** — `@Entity` is JPA, use `@Document` for MongoDB
2. **Forgetting `@EnableMongoAuditing`** — `@CreatedDate`/`@LastModifiedDate` won't populate
3. **Not creating indexes** — use `@Indexed` or `@CompoundIndex` for query performance
4. **Treating MongoDB like a relational DB** — denormalize data, avoid excessive `$lookup` (joins)
5. **Using auto-generated `ObjectId` as string** — the `@Id` field is a `String` that maps to MongoDB's `_id`

## Official Sources

- MongoDB: `https://docs.spring.io/spring-boot/reference/data/nosql.html#data.nosql.mongodb`
- Spring Data MongoDB: `https://docs.spring.io/spring-data/mongodb/reference/`
