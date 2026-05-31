---
name: sql
description: "Apache Spark SQL with Scala — SparkSession, DataFrame/Dataset API, transformations, joins, aggregations, window functions, UDFs, and reading/writing data sources"
metadata:
  languages: "scala"
  versions: "4.1.2"
  revision: 1
  updated-on: "2026-05-31"
  source: community
  tags: "spark,scala,sql,dataframe,dataset,bigdata,etl"
---

# Apache Spark SQL — Scala Guide

Spark 4.x is built **only for Scala 2.13** (Scala 2.12 support was dropped). Use the `_2.13` Maven artifacts.

```scala
// build.sbt
libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-sql"  % "4.1.2" % "provided",
  "org.apache.spark" %% "spark-core" % "4.1.2" % "provided"
)
// scalaVersion := "2.13.14"
```

```xml
<!-- Maven -->
<dependency>
  <groupId>org.apache.spark</groupId>
  <artifactId>spark-sql_2.13</artifactId>
  <version>4.1.2</version>
  <scope>provided</scope>
</dependency>
```

Use `provided` scope for jobs submitted via `spark-submit` (the cluster supplies Spark). Drop `provided` only for local/standalone runs.

## SparkSession — the Entry Point

`SparkSession` is the single entry point. Do **not** create `SparkContext`/`SQLContext` directly in modern code.

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder()
  .appName("my-job")
  .master("local[*]")              // omit on a cluster; set via spark-submit
  .config("spark.sql.shuffle.partitions", "200")
  .getOrCreate()

import spark.implicits._           // enables $"col", .toDF, Dataset encoders
spark.sparkContext.setLogLevel("WARN")
```

`import spark.implicits._` is required for `$"column"` syntax, `Seq(...).toDF()`, and automatic `Encoder`s for `Dataset[T]`. Always import it after creating the session.

## Reading Data

```scala
import org.apache.spark.sql.DataFrame

// CSV with schema inference (scans the file; avoid on huge data)
val df = spark.read
  .option("header", "true")
  .option("inferSchema", "true")
  .csv("data/people.csv")

// Parquet (preferred — columnar, typed, splittable)
val parquet = spark.read.parquet("data/events.parquet")

// JSON
val json = spark.read.json("data/records.json")

// JDBC
val jdbc = spark.read
  .format("jdbc")
  .option("url", "jdbc:postgresql://host:5432/db")
  .option("dbtable", "public.orders")
  .option("user", "u").option("password", "p")
  .load()
```

### Explicit schema (skip inference for speed and correctness)

```scala
import org.apache.spark.sql.types._

val schema = StructType(Seq(
  StructField("id",    LongType,   nullable = false),
  StructField("name",  StringType, nullable = true),
  StructField("score", DoubleType, nullable = true)
))

val typed = spark.read.schema(schema).option("header", "true").csv("data/people.csv")
```

## DataFrame Transformations

`DataFrame` is `Dataset[Row]`. All transformations are **lazy** — nothing runs until an action (`show`, `count`, `collect`, `write`).

```scala
import org.apache.spark.sql.functions._

val result = df
  .select($"id", $"name", $"score")
  .filter($"score" > 50)                       // or .where(...)
  .withColumn("grade", when($"score" >= 90, "A")
                       .when($"score" >= 70, "B")
                       .otherwise("C"))
  .withColumnRenamed("name", "full_name")
  .drop("score")
  .orderBy($"grade".asc, $"id".desc)

result.show(20, truncate = false)
```

### Column references

Three equivalent styles; prefer `$"col"` (needs `spark.implicits._`):

```scala
df.select($"score" + 1)            // implicits — recommended
df.select(col("score") + 1)        // functions.col — no implicits needed
df.select(df("score") + 1)         // DataFrame apply — disambiguates self-joins
```

### Common column expressions

```scala
df.select(
  $"name",
  upper($"name").as("upper_name"),
  $"score".cast("int").as("score_int"),
  coalesce($"score", lit(0.0)).as("score_or_zero"),
  concat_ws(" ", $"first", $"last").as("full"),
  to_date($"created_at", "yyyy-MM-dd").as("created_date")
)
```

## Aggregations

```scala
import org.apache.spark.sql.functions._

val agg = df.groupBy($"grade")
  .agg(
    count("*").as("n"),
    avg($"score").as("avg_score"),
    max($"score").as("max_score"),
    countDistinct($"name").as("distinct_names")
  )
  .filter($"n" > 1)                  // HAVING

// Single-column quick aggs
df.groupBy("grade").count()
df.agg(sum("score"), min("score"))   // whole-DataFrame aggregate
```

## Joins

```scala
// Inner join on a shared column name (no duplicate column produced)
val joined = orders.join(customers, Seq("customer_id"), "inner")

// Join on an expression (keeps both key columns)
val j2 = orders.join(customers, orders("cust_id") === customers("id"), "left")

// Join types: "inner", "left"/"left_outer", "right", "full"/"full_outer",
//             "left_semi", "left_anti", "cross"

// Broadcast the small side to avoid a shuffle (huge perf win)
import org.apache.spark.sql.functions.broadcast
val fast = bigDf.join(broadcast(smallDf), Seq("key"))
```

Broadcast joins replicate the small DataFrame to every executor, skipping the shuffle. Spark auto-broadcasts tables below `spark.sql.autoBroadcastJoinThreshold` (default 10 MB); use the `broadcast()` hint when the optimizer misjudges size.

## Window Functions

```scala
import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.functions._

val w = Window.partitionBy($"dept").orderBy($"salary".desc)

val ranked = employees
  .withColumn("rank",        rank().over(w))
  .withColumn("dense_rank",  dense_rank().over(w))
  .withColumn("row_num",     row_number().over(w))
  .withColumn("dept_total",  sum($"salary").over(Window.partitionBy($"dept")))
  .withColumn("prev_salary", lag($"salary", 1).over(w))

// Top-N per group
ranked.filter($"row_num" <= 3)
```

## Typed Datasets

`Dataset[T]` gives compile-time type safety with case classes. Encoders come from `spark.implicits._`.

```scala
case class Person(id: Long, name: String, score: Double)

val people: Dataset[Person] = df.as[Person]      // DataFrame -> typed Dataset

// Typed, lambda-based ops (no string columns)
val highScorers = people
  .filter(_.score > 90)
  .map(p => p.name.toUpperCase)                   // Dataset[String]

val total: Double = people.map(_.score).reduce(_ + _)
```

Prefer the DataFrame (`$"col"`) API for most ETL — the Catalyst optimizer sees into it. Typed lambdas (`.map`, `.filter(_.x)`) are opaque to the optimizer and can be slower, but give type safety. Mix pragmatically.

## User-Defined Functions (UDFs)

Reach for built-in `functions` first — they are optimized and run in the JVM. Use a UDF only when no built-in fits.

```scala
import org.apache.spark.sql.functions.udf

val maskEmail = udf((email: String) =>
  if (email == null) null else email.replaceAll("(?<=.).(?=.*@)", "*"))

val masked = df.withColumn("email_masked", maskEmail($"email"))

// Register for use in spark.sql(...)
spark.udf.register("mask_email", maskEmail)
```

UDFs are a black box to Catalyst (no predicate pushdown, serialization overhead). Built-in functions and `when`/`expr` are almost always faster.

## Spark SQL (string queries)

```scala
df.createOrReplaceTempView("people")

val adults = spark.sql("""
  SELECT grade, COUNT(*) AS n, AVG(score) AS avg_score
  FROM people
  WHERE score > 50
  GROUP BY grade
  HAVING COUNT(*) > 1
  ORDER BY avg_score DESC
""")
```

`spark.sql` and the DataFrame API compile to the same Catalyst plan — pick whichever is clearer for the task.

## Writing Data

```scala
result.write
  .mode("overwrite")                 // overwrite | append | ignore | error (default)
  .partitionBy("grade")              // creates grade=A/, grade=B/ directories
  .parquet("output/results")

// Coalesce/repartition before writing to control file count
result.coalesce(1).write.mode("overwrite").csv("output/single")     // reduce partitions, no shuffle
result.repartition(10).write.parquet("output/ten")                  // full shuffle to N partitions
```

`coalesce(n)` reduces partitions without a shuffle (cheap); `repartition(n)` does a full shuffle (use to increase partitions or rebalance skew).

## Lazy Evaluation & Caching

Transformations build a plan; **actions** trigger execution. Cache a DataFrame reused across multiple actions:

```scala
val base = df.filter($"score" > 0).cache()    // marks for caching; first action populates it
base.count()                                   // action — materializes cache
base.groupBy("grade").count().show()           // reuses cached data
base.unpersist()                               // free when done
```

Actions: `show`, `count`, `collect`, `take(n)`, `first`, `write`, `foreach`. `collect` pulls all rows to the driver — never call it on large data (OOM risk); use `take(n)` or write to storage instead.

## Inspecting Plans

```scala
df.printSchema()                 // column names + types
df.explain(true)                 // logical + physical plan (debug perf)
df.show(5)
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Using Scala 2.12 artifacts with Spark 4 | Spark 4 is 2.13-only; use `_2.13` artifacts |
| `collect()` on large data | Use `take(n)`, `show()`, or `write` |
| Forgetting `import spark.implicits._` | Required for `$"col"`, `.toDF`, `.as[T]` |
| UDF where a built-in exists | Prefer `org.apache.spark.sql.functions._` |
| `inferSchema` on huge files | Provide an explicit `StructType` |
| `repartition(1)` to get one file | Use `coalesce(1)` — avoids a full shuffle |
| Expecting transformations to run immediately | They are lazy; only actions execute |
