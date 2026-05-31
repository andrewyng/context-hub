---
name: structured-streaming
description: "Spark Structured Streaming with Scala — readStream/writeStream, output modes, event-time windows, watermarking, stateful aggregations, stream-stream joins, checkpointing, and Kafka integration"
metadata:
  languages: "scala"
  versions: "4.1.2"
  revision: 1
  updated-on: "2026-05-31"
  source: community
  tags: "spark,scala,streaming,structured-streaming,kafka,realtime,etl"
---

# Spark Structured Streaming — Scala Guide

Structured Streaming treats a live data stream as an unbounded table you query with the **same DataFrame/Dataset API** as batch. Spark runs it incrementally and keeps results consistent. Spark 4.x is Scala **2.13** only.

```scala
// build.sbt
libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-sql"               % "4.1.2" % "provided",
  // Kafka source/sink — match the Spark version, NOT provided:
  "org.apache.spark" %% "spark-sql-kafka-0-10"    % "4.1.2"
)
```

The core streaming API lives in `spark-sql`. The Kafka connector (`spark-sql-kafka-0-10`) is a separate artifact and must be on the runtime classpath (e.g. `--packages org.apache.spark:spark-sql-kafka-0-10_2.13:4.1.2` for `spark-submit`).

## Read a Stream

`spark.readStream` returns a streaming `DataFrame`. A schema is **required** for file sources (no inference on streams).

```scala
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.types._

val spark = SparkSession.builder().appName("stream").getOrCreate()
import spark.implicits._

val schema = StructType(Seq(
  StructField("user_id", StringType),
  StructField("event",   StringType),
  StructField("ts",      TimestampType)
))

// File source — picks up new files dropped into the directory
val events = spark.readStream
  .schema(schema)
  .option("maxFilesPerTrigger", 100)
  .json("s3a://bucket/events/")

events.isStreaming    // true
```

### Kafka source

```scala
val kafka = spark.readStream
  .format("kafka")
  .option("kafka.bootstrap.servers", "broker:9092")
  .option("subscribe", "events")
  .option("startingOffsets", "latest")     // or "earliest"
  .load()

// Kafka columns are binary; cast value to string and parse
import org.apache.spark.sql.functions._
val parsed = kafka
  .select($"value".cast("string").as("json"), $"timestamp")
  .select(from_json($"json", schema).as("d"), $"timestamp")
  .select("d.*", "timestamp")
```

## Transform

Streaming DataFrames support most batch operations — `select`, `filter`, `withColumn`, `groupBy` — using the identical API. Some operations (e.g. multiple aggregations, certain joins, `distinct`) are restricted on streams; see the unsupported-ops note below.

```scala
val cleaned = parsed
  .filter($"event".isNotNull)
  .withColumn("event", lower($"event"))
```

## Write a Stream & Output Modes

`writeStream` defines the sink and starts a continuous query. Choose an **output mode**:

| Mode | Emits | Use with |
|---|---|---|
| `append` (default) | only new rows | maps/filters; aggregations **with** watermark |
| `update` | rows that changed this trigger | aggregations (most common) |
| `complete` | the entire result table every trigger | aggregations only; small result sets |

```scala
val query = cleaned.writeStream
  .format("parquet")
  .outputMode("append")
  .option("path", "s3a://bucket/out/")
  .option("checkpointLocation", "s3a://bucket/checkpoints/job1")  // REQUIRED
  .trigger(org.apache.spark.sql.streaming.Trigger.ProcessingTime("30 seconds"))
  .start()

query.awaitTermination()    // block the driver until the query stops
```

**`checkpointLocation` is mandatory for production** — it stores offsets and state so the query resumes exactly-once after a restart. Use a unique, durable path per query; never share one between queries.

### Triggers

```scala
import org.apache.spark.sql.streaming.Trigger

Trigger.ProcessingTime("30 seconds")  // micro-batch every 30s
Trigger.AvailableNow()                // process all available data, then stop (batch-like)
Trigger.Continuous("1 second")        // experimental low-latency mode
// (no trigger) = process as fast as possible, back-to-back micro-batches
```

`Trigger.AvailableNow()` is ideal for scheduled "drain the backlog and exit" jobs — it gives streaming's exactly-once + checkpointing with batch-style finite execution.

## Event-Time Windows & Watermarking

Aggregate over **event time** (when the event happened), not processing time. A **watermark** tells Spark how late data may arrive, so it can drop old state and finalize windows.

```scala
import org.apache.spark.sql.functions._

val counts = parsed
  .withWatermark("timestamp", "10 minutes")          // tolerate 10 min lateness
  .groupBy(
    window($"timestamp", "5 minutes"),               // tumbling 5-min windows
    $"event"
  )
  .count()

counts.writeStream
  .outputMode("update")                              // or "append" (emits on window close)
  .format("console")
  .option("checkpointLocation", "/chk/win")
  .start()
```

- **Tumbling window:** `window($"ts", "5 minutes")` — fixed, non-overlapping.
- **Sliding window:** `window($"ts", "10 minutes", "5 minutes")` — size, then slide.
- Without `withWatermark`, state for aggregations grows unbounded. Always set it for event-time aggregations.
- `append` mode emits a window's result only once the watermark passes the window end (delayed but final); `update` emits running results each trigger.

## Stream–Stream Joins

Both sides need watermarks (so state can be bounded) plus a time-range condition.

```scala
val impressions = imp.withWatermark("imp_time", "2 hours")
val clicks      = clk.withWatermark("click_time", "3 hours")

val joined = impressions.join(clicks,
  expr("""
    imp_id = click_imp_id AND
    click_time >= imp_time AND
    click_time <= imp_time + interval 1 hour
  """),
  "inner"        // inner; or "leftOuter"/"rightOuter" with watermark on the outer side
)
```

A stream can also join a **static** DataFrame (e.g. a lookup/dimension table) with no watermark needed — the static side is re-read each trigger.

## Arbitrary Stateful Processing

For custom state (sessionization, dedup, running logic) beyond built-in aggregations, use `flatMapGroupsWithState` / `mapGroupsWithState` with `GroupStateTimeout`.

```scala
import org.apache.spark.sql.streaming.{GroupState, GroupStateTimeout}

case class Event(user: String, ts: Long)
case class Session(user: String, count: Int, lastTs: Long)

def update(user: String, events: Iterator[Event], state: GroupState[Session]): Session = {
  if (state.hasTimedOut) { val s = state.get; state.remove(); s }
  else {
    val evs = events.toSeq
    val prev = state.getOption.getOrElse(Session(user, 0, 0L))
    val next = Session(user, prev.count + evs.size, evs.map(_.ts).max)
    state.update(next)
    state.setTimeoutDuration("30 minutes")
    next
  }
}

val sessions = events.as[Event]
  .groupByKey(_.user)
  .mapGroupsWithState[Session, Session](GroupStateTimeout.ProcessingTimeTimeout())(update)
```

## Custom Sink — foreachBatch

`foreachBatch` hands you each micro-batch as a normal batch `DataFrame` — use it for sinks without native support (JDBC, upserts, multiple destinations).

```scala
cleaned.writeStream
  .outputMode("update")
  .foreachBatch { (batchDf: org.apache.spark.sql.DataFrame, batchId: Long) =>
    batchDf.persist()
    batchDf.write.mode("append").format("jdbc")
      .option("url", "jdbc:postgresql://h/db").option("dbtable", "agg").save()
    batchDf.unpersist()
  }
  .option("checkpointLocation", "/chk/fb")
  .start()
```

Inside `foreachBatch` the batch DataFrame is finite, so otherwise-unsupported batch operations work. Make writes **idempotent** (use `batchId`) since a batch may be reprocessed after failure.

## Monitoring

```scala
query.id            // stable id across restarts
query.status        // current state
query.lastProgress  // metrics: input rate, batch duration, state rows
query.recentProgress
spark.streams.active            // all running queries
spark.streams.awaitAnyTermination()
```

## Unsupported / Restricted on Streams

A few batch operations don't apply to unbounded streams. Common ones:

- Multiple streaming aggregations chained together
- `limit`, `take(n)`, `distinct` (use `dropDuplicates` with a watermark instead)
- Sorting (`orderBy`) except after an aggregation in `complete` mode
- `count()`/`collect()` actions — use a sink, not an action

Wrap such logic in `foreachBatch` where the per-batch DataFrame is finite.

## Common Mistakes

| Mistake | Fix |
|---|---|
| No `checkpointLocation` | Required for fault tolerance + exactly-once; unique path per query |
| Event-time aggregation without `withWatermark` | State grows unbounded; always set a watermark |
| `inferSchema` / no schema on a file stream | Provide an explicit `StructType` |
| `outputMode("complete")` on a non-aggregating query | Only valid for aggregations; use `append` |
| Sharing one checkpoint across queries | One dedicated checkpoint dir per query |
| Non-idempotent writes in `foreachBatch` | Key on `batchId`; batches can be retried |
| Kafka connector missing at runtime | Add `spark-sql-kafka-0-10_2.13:4.1.2` via `--packages` |
