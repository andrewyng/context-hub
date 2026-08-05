---
name: spring-boot-docker-compose
description: "Spring Boot 4.0.x Docker Compose integration — automatic service startup, service connections, and development-time container management"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-docker-compose,docker,containers,dev-services,development"
---

# Spring Boot Docker Compose for 4.0.x

## What This Covers

Spring Boot's built-in Docker Compose integration — automatically starts containers defined in `compose.yml` when the application starts, auto-configures connection properties, and stops containers on shutdown. Designed for development only.

- Starter: `spring-boot-docker-compose`
- Docs: `https://docs.spring.io/spring-boot/how-to/docker-compose.html`

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-docker-compose</artifactId>
    <scope>runtime</scope>
</dependency>
```

Use `runtime` scope — this is a development-only feature.

## compose.yml

```yaml
services:
  postgres:
    image: postgres:17
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:4-management
    ports:
      - "5672:5672"
      - "15672:15672"
```

## How It Works

When you run your Spring Boot app, it automatically:

1. Detects `compose.yml` (or `docker-compose.yml`) in the project root
2. Runs `docker compose up` to start the services
3. Waits for services to be ready
4. Auto-configures connection properties (datasource URL, Redis host, etc.) via `@ServiceConnection`
5. On shutdown, runs `docker compose stop` (or `down` based on config)

No `application.yml` datasource configuration needed — Boot reads connection details from the running containers.

## Configuration

```yaml
spring:
  docker:
    compose:
      enabled: true  # default
      file: compose.yml
      lifecycle-management: start-and-stop  # or start-only, none
      stop:
        command: down  # or stop
        timeout: 10s
      skip:
        in-tests: true
      profiles:
        active: dev
```

## Service Connection Labels

Use Docker labels to help Boot identify the service type:

```yaml
services:
  mydb:
    image: postgres:17
    labels:
      org.springframework.boot.service-connection: postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

## Supported Services (auto-detected)

Boot auto-configures connections for: PostgreSQL, MySQL, MariaDB, MongoDB, Redis, RabbitMQ, Kafka, Elasticsearch, Cassandra, Zipkin, and more. The container image name is used to identify the service type.

## Disabling for Production

```yaml
# application-prod.yml
spring:
  docker:
    compose:
      enabled: false
```

Or simply don't include the dependency in production builds (using Maven profiles or Gradle configurations).

## Common Mistakes

1. **Including `spring-boot-docker-compose` in production** — use `runtime` scope and exclude from prod
2. **Defining datasource URL in application.yml** — conflicts with auto-configured connection; let Boot derive it from Docker
3. **Using `docker-compose` v1 CLI** — Boot requires Docker Compose v2 (`docker compose` without hyphen)
4. **Not having Docker running** — app fails to start if Docker daemon is unavailable and compose is enabled

## Official Sources

- Docker Compose: `https://docs.spring.io/spring-boot/reference/features/dev-services.html`
- How-to: `https://docs.spring.io/spring-boot/how-to/docker-compose.html`
