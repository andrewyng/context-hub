---
name: spring-batch
description: "Spring Batch 6.0.x with Spring Boot 4.0.x — job configuration, chunk processing, readers/writers, job scheduling, and error handling"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-batch,batch-processing,etl,jobs,chunk,reader,writer,scheduling"
---

# Spring Batch for Spring Boot 4.0.x

## What This Covers

Batch processing with Spring Boot 4.0.x — job/step configuration, chunk-oriented processing, item readers and writers, database and file I/O, scheduling, and error handling. Uses Spring Batch 6.0.x.

- Starter: `spring-boot-starter-batch`
- Docs: `https://docs.spring.io/spring-boot/reference/io/spring-batch.html`

**Note:** `@EnableBatchProcessing` turns off ALL batch auto-configuration in Boot 4, including schema initialization. Omit it unless you need to customize the entire batch infrastructure.

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-batch</artifactId>
</dependency>
<!-- Batch metadata store -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Configuration

```yaml
spring:
  batch:
    jdbc:
      initialize-schema: always  # creates batch metadata tables
    job:
      enabled: true  # run jobs on startup (set false if using scheduler)
```

## Basic Job with Chunk Processing

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.database.JdbcBatchItemWriter;
import org.springframework.batch.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.PlatformTransactionManager;
import javax.sql.DataSource;

@Configuration
public class ImportJobConfig {

    @Bean
    public Job importJob(JobRepository jobRepository, Step importStep) {
        return new JobBuilder("importJob", jobRepository)
            .start(importStep)
            .build();
    }

    @Bean
    public Step importStep(JobRepository jobRepository,
                           PlatformTransactionManager txManager,
                           FlatFileItemReader<ProductCsv> reader,
                           ItemProcessor<ProductCsv, Product> processor,
                           JdbcBatchItemWriter<Product> writer) {
        return new StepBuilder("importStep", jobRepository)
            .<ProductCsv, Product>chunk(100, txManager)
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .faultTolerant()
            .skipLimit(10)
            .skip(Exception.class)
            .build();
    }

    @Bean
    public FlatFileItemReader<ProductCsv> reader() {
        return new FlatFileItemReaderBuilder<ProductCsv>()
            .name("productReader")
            .resource(new ClassPathResource("products.csv"))
            .delimited()
            .names("name", "description", "price")
            .targetType(ProductCsv.class)
            .linesToSkip(1)
            .build();
    }

    @Bean
    public ItemProcessor<ProductCsv, Product> processor() {
        return csv -> new Product(csv.name(), csv.description(), Double.parseDouble(csv.price()));
    }

    @Bean
    public JdbcBatchItemWriter<Product> writer(DataSource dataSource) {
        return new JdbcBatchItemWriterBuilder<Product>()
            .sql("INSERT INTO products (name, description, price) VALUES (:name, :description, :price)")
            .dataSource(dataSource)
            .beanMapped()
            .build();
    }
}
```

```java
public record ProductCsv(String name, String description, String price) {}
```

## Tasklet Step (simple, non-chunk)

```java
@Bean
public Step cleanupStep(JobRepository jobRepository,
                        PlatformTransactionManager txManager) {
    return new StepBuilder("cleanupStep", jobRepository)
        .tasklet((contribution, chunkContext) -> {
            // cleanup logic
            jdbcTemplate.execute("DELETE FROM temp_imports");
            return RepeatStatus.FINISHED;
        }, txManager)
        .build();
}
```

## Multi-Step Job

```java
@Bean
public Job etlJob(JobRepository jobRepository, Step extractStep,
                   Step transformStep, Step loadStep) {
    return new JobBuilder("etlJob", jobRepository)
        .start(extractStep)
        .next(transformStep)
        .next(loadStep)
        .build();
}
```

## Job Scheduling

```java
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final Job importJob;

    public BatchScheduler(JobLauncher jobLauncher, Job importJob) {
        this.jobLauncher = jobLauncher;
        this.importJob = importJob;
    }

    @Scheduled(cron = "0 0 2 * * *") // daily at 2 AM
    public void runImport() throws Exception {
        JobParameters params = new JobParametersBuilder()
            .addLong("timestamp", System.currentTimeMillis())
            .toJobParameters();
        jobLauncher.run(importJob, params);
    }
}
```

Set `spring.batch.job.enabled=false` when using a scheduler to prevent auto-run on startup.

## Common Mistakes

1. **Using `@EnableBatchProcessing`** — in Boot 4 this disables all auto-configuration including schema init
2. **Not adding unique `JobParameters`** — same parameters = job not re-executed (already COMPLETED)
3. **Chunk size too small** — 1 commit per item kills performance; use 100-1000
4. **Missing transaction manager in step builder** — required parameter in Boot 4
5. **Not setting `spring.batch.job.enabled=false` with scheduler** — job runs twice (startup + scheduled)

## Official Sources

- Spring Batch in Boot: `https://docs.spring.io/spring-boot/reference/io/spring-batch.html`
- Spring Batch: `https://docs.spring.io/spring-batch/reference/`
