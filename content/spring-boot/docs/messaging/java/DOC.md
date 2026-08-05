---
name: spring-boot-messaging
description: "Spring Boot 4.0.x messaging with Apache Kafka and RabbitMQ (AMQP) — producers, consumers, configuration, error handling, and dead letter queues"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-messaging,kafka,rabbitmq,amqp,event-driven,async,message-queue"
---

# Spring Boot Messaging for 4.0.x

## What This Covers

Asynchronous messaging with Spring Boot 4.0.x — Apache Kafka for event streaming and RabbitMQ (AMQP) for message queuing, including producers, consumers, serialization, error handling, and dead letter topics/queues.

## Apache Kafka

### Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-kafka</artifactId>
</dependency>
```

Note: In Boot 4.0, the starter is `spring-boot-starter-kafka` (uses Spring for Apache Kafka 4.0).

### Configuration

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: myapp-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: "com.example.myapp.events"
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

### Producer

```java
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventPublisher {

    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public OrderEventPublisher(KafkaTemplate<String, OrderEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishOrderCreated(Order order) {
        var event = new OrderEvent(order.getId(), "CREATED", order.getTotal());
        kafkaTemplate.send("order-events", order.getId().toString(), event);
    }
}
```

### Consumer

```java
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class OrderEventConsumer {

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void handleOrderEvent(OrderEvent event) {
        switch (event.type()) {
            case "CREATED" -> sendConfirmationEmail(event);
            case "CANCELLED" -> sendCancellationEmail(event);
        }
    }
}
```

### Event Record

```java
public record OrderEvent(
    Long orderId,
    String type,
    Double total
) {}
```

### Error Handling with Dead Letter Topic

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
public class KafkaConfig {

    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, Object> template) {
        var recoverer = new DeadLetterPublishingRecoverer(template);
        return new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 3));
    }
}
```

## RabbitMQ (AMQP)

### Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
```

### Configuration

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

### Queue, Exchange, and Binding

```java
import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String QUEUE = "order-queue";
    public static final String EXCHANGE = "order-exchange";
    public static final String ROUTING_KEY = "order.created";

    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable(QUEUE).build();
    }

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Binding binding(Queue orderQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderQueue)
            .to(orderExchange)
            .with(ROUTING_KEY);
    }
}
```

### Producer

```java
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderMessageSender {

    private final RabbitTemplate rabbitTemplate;

    public OrderMessageSender(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendOrderCreated(OrderEvent event) {
        rabbitTemplate.convertAndSend(
            RabbitConfig.EXCHANGE,
            RabbitConfig.ROUTING_KEY,
            event
        );
    }
}
```

### Consumer

```java
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderMessageListener {

    @RabbitListener(queues = RabbitConfig.QUEUE)
    public void handleOrder(OrderEvent event) {
        System.out.println("Received order: " + event.orderId());
    }
}
```

### JSON Serialization for RabbitMQ

```java
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;

@Configuration
public class RabbitConfig {

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
```

## Common Mistakes

1. **Not setting `spring.json.trusted.packages`** for Kafka JSON deserialization — fails with untrusted class error
2. **Missing `group-id` for Kafka consumer** — consumer won't start
3. **Not configuring JSON converter for RabbitMQ** — messages sent as Java-serialized bytes instead of JSON
4. **No error handling/DLQ** — poison messages block the consumer forever
5. **Blocking operations in listeners** — use `@Async` or separate thread pools for heavy processing

## Official Sources

- Kafka: `https://docs.spring.io/spring-boot/reference/messaging/kafka.html`
- AMQP: `https://docs.spring.io/spring-boot/reference/messaging/amqp.html`
