---
name: spring-boot-packaging
description: "Spring Boot 4.0.x packaging and deployment — executable JARs, Docker images, GraalVM native images, AOT processing, and cloud deployment"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-packaging,docker,graalvm,native-image,aot,deployment,container-images"
---

# Spring Boot Packaging & Deployment for 4.0.x

## What This Covers

Packaging Spring Boot 4.0.x applications for production — executable JARs, layered Docker images, GraalVM native images, AOT processing, and deployment patterns.

Boot 4.0 removed the classic uber-jar loader and embedded launch scripts.

- Docs: `https://docs.spring.io/spring-boot/reference/packaging/index.html`

## Executable JAR

### Maven

```bash
./mvnw package
java -jar target/myapp-0.0.1-SNAPSHOT.jar
```

### Gradle

```bash
./gradlew bootJar
java -jar build/libs/myapp-0.0.1-SNAPSHOT.jar
```

## Dockerfile (multi-stage, layered)

```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests

# Extract layers
FROM eclipse-temurin:21-jdk AS layers
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN java -Djarmode=tools -jar app.jar extract --layers --destination extracted

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=layers /app/extracted/dependencies/ ./
COPY --from=layers /app/extracted/spring-boot-loader/ ./
COPY --from=layers /app/extracted/snapshot-dependencies/ ./
COPY --from=layers /app/extracted/application/ ./
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Cloud Native Buildpacks (no Dockerfile needed)

### Maven

```bash
./mvnw spring-boot:build-image -Dspring-boot.build-image.imageName=myapp:latest
```

### Gradle

```bash
./gradlew bootBuildImage --imageName=myapp:latest
```

Uses Paketo Buildpacks — produces OCI-compliant images automatically.

## GraalVM Native Image

Requires GraalVM 25+ and Native Build Tools 0.11.5.

### Maven

```bash
./mvnw -Pnative native:compile
./target/myapp  # starts in milliseconds
```

### Gradle

```bash
./gradlew nativeCompile
./build/native/nativeCompile/myapp
```

### Native Image as Docker

```bash
./mvnw spring-boot:build-image -Pnative
```

## AOT Processing

Ahead-of-Time processing generates optimized code at build time:

```bash
# Maven
./mvnw process-aot

# Gradle
./gradlew processAot
```

AOT is automatically applied when building native images. For JVM deployments, AOT Cache improves startup time:

```yaml
spring:
  aot:
    cache:
      enabled: true
```

## Production Configuration

```yaml
# application-prod.yml
server:
  port: 8080
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate

management:
  endpoints:
    web:
      exposure:
        include: health,prometheus
  endpoint:
    health:
      probes:
        enabled: true  # enables /actuator/health/liveness and /readiness

logging:
  level:
    root: WARN
    com.example: INFO
```

## Kubernetes Health Probes

```yaml
# Kubernetes deployment snippet
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
```

Enable in Spring Boot:

```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true
```

## Common Mistakes

1. **Using classic uber-jar loader** — removed in Boot 4.0, remove `<loaderImplementation>CLASSIC</loaderImplementation>` from build
2. **Using embedded launch scripts** — removed in Boot 4.0, use `java -jar` or container deployment
3. **Not using layered jars for Docker** — unlayered images rebuild everything on each code change
4. **Using `ddl-auto=update` in production** — use Flyway or Liquibase
5. **Not setting graceful shutdown** — in-flight requests dropped during deployment
6. **Missing health probes for Kubernetes** — pods get killed without proper liveness/readiness checks

## Official Sources

- Packaging: `https://docs.spring.io/spring-boot/reference/packaging/index.html`
- Container Images: `https://docs.spring.io/spring-boot/reference/packaging/container-images/index.html`
- Native Images: `https://docs.spring.io/spring-boot/reference/packaging/native-image/index.html`
- Deployment: `https://docs.spring.io/spring-boot/how-to/deployment/index.html`
