---
name: delta-spark
description: "Delta Lake with Spark and Scala — ACID tables, MERGE upserts, time travel, schema evolution, DeltaTable API, OPTIMIZE/Z-ORDER, VACUUM, and change data feed"
metadata:
  languages: "scala"
  versions: "4.2.0"
  revision: 1
  updated-on: "2026-05-31"
  source: community
  tags: "delta,deltalake,spark,scala,lakehouse,acid,merge,bigdata"
---

# Delta Lake — Scala Guide

Delta Lake adds ACID transactions, upserts, time travel, and schema enforcement on top of Parquet for Spark. Delta **4.2.0** targets **Spark 4.1.x** and Scala **2.13**.

```scala
// build.sbt
libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-sql"  % "4.1.2" % "provided",
  "io.delta"         %% "delta-spark" % "4.2.0"
)
```

The Scala/Java artifact is `delta-spark` (not `delta-core`, which was the pre-3.0 name). Maven coordinate: `io.delta:delta-spark_2.13:4.2.0`. Delta 4.2.0 is built against Spark 4.1.x — pair it with a Spark 4.1.x runtime.

## SparkSession Configuration (Required)

Delta needs its SQL extension and catalog wired into the session, or `delta` format and `DeltaTable` APIs won't resolve.

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder()
  .appName("delta-job")
  .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
  .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
  .getOrCreate()
import spark.implicits._
```

For `spark-submit`/`spark-shell`, the helper `io.delta.sql.DeltaSparkSessionExtension` config can also be injected via `--packages io.delta:delta-spark_2.13:4.2.0` plus the two `--conf` lines above.

## Create & Write a Delta Table

Writing with `.format("delta")` creates a transactional table — no separate DDL needed for path-based tables.

```scala
val df = Seq((1L, "alice", 100.0), (2L, "bob", 80.0)).toDF("id", "name", "score")

// Path-based table
df.write.format("delta").mode("overwrite").save("/data/scores")

// Metastore table
df.write.format("delta").mode("overwrite").saveAsTable("scores")

// Partitioned
df.write.format("delta").partitionBy("name").mode("append").save("/data/scores")
```

## Read

```scala
val byPath  = spark.read.format("delta").load("/data/scores")
val byTable = spark.read.table("scores")
spark.sql("SELECT * FROM delta.`/data/scores` WHERE score > 90").show()
```

## MERGE (Upsert)

The headline feature — atomic insert/update/delete in one transaction. Use the `DeltaTable` API.

```scala
import io.delta.tables.DeltaTable

val target = DeltaTable.forPath(spark, "/data/scores")

val updates = Seq((1L, "alice", 150.0), (3L, "carol", 70.0)).toDF("id", "name", "score")

target.as("t")
  .merge(updates.as("s"), "t.id = s.id")
  .whenMatched().updateExpr(Map("score" -> "s.score"))
  .whenNotMatched().insertAll()
  .execute()
```

More complete MERGE with conditional update and delete:

```scala
target.as("t")
  .merge(updates.as("s"), "t.id = s.id")
  .whenMatched("s.score = 0").delete()                     // delete when source score is 0
  .whenMatched().updateExpr(Map("score" -> "s.score"))     // otherwise update
  .whenNotMatched().insertExpr(Map(
    "id" -> "s.id", "name" -> "s.name", "score" -> "s.score"))
  .whenNotMatchedBySource("t.score < 0").delete()          // target rows with no match
  .execute()
```

`updateAll()`/`insertAll()` map every column by name (require matching schemas); `updateExpr`/`insertExpr` take explicit per-column SQL expressions.

## Update & Delete

```scala
import org.apache.spark.sql.functions._

val dt = DeltaTable.forPath(spark, "/data/scores")

dt.updateExpr("score < 60", Map("score" -> "60"))          // floor low scores
dt.update(col("name") === "bob", Map("score" -> lit(0.0))) // typed variant
dt.delete("score = 0")                                     // delete predicate
```

## Time Travel

Every write is a versioned commit. Read an older snapshot by version or timestamp.

```scala
spark.read.format("delta").option("versionAsOf", 0).load("/data/scores")
spark.read.format("delta").option("timestampAsOf", "2026-05-30 00:00:00").load("/data/scores")

// SQL
spark.sql("SELECT * FROM delta.`/data/scores` VERSION AS OF 0")
spark.sql("SELECT * FROM delta.`/data/scores` TIMESTAMP AS OF '2026-05-30'")

// History of operations (version, timestamp, operation, metrics)
DeltaTable.forPath(spark, "/data/scores").history().show(false)
```

## Schema Evolution & Enforcement

Delta enforces schema on write by default (mismatched writes fail). Opt into evolution explicitly.

```scala
// Add new columns automatically on append
newDf.write.format("delta")
  .option("mergeSchema", "true")
  .mode("append").save("/data/scores")

// Schema evolution within a MERGE
spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")

// Replace the schema entirely (drops/renames) — destructive
df.write.format("delta").option("overwriteSchema", "true")
  .mode("overwrite").save("/data/scores")
```

Without `mergeSchema`/`overwriteSchema`, a write whose columns or types differ from the table fails fast — this enforcement is the point, so opt in deliberately.

## OPTIMIZE, Z-ORDER & VACUUM

Streaming/append workloads create many small files. Compact and clean them.

```scala
val dt = DeltaTable.forPath(spark, "/data/scores")

// Compact small files into larger ones
dt.optimize().executeCompaction()

// Z-Order: co-locate data by columns frequently filtered on (data skipping)
dt.optimize().executeZOrderBy("id", "name")

// SQL form
spark.sql("OPTIMIZE delta.`/data/scores` ZORDER BY (id)")

// Remove files no longer referenced (default retention 7 days)
dt.vacuum()        // uses default 168h retention
dt.vacuum(168)     // explicit hours
```

`VACUUM` permanently deletes unreferenced data files older than the retention window — this **breaks time travel** to versions that relied on them. Don't lower retention below the longest time-travel window you need. Spark blocks retention < 168h unless `spark.databricks.delta.retentionDurationCheck.enabled=false`.

## Change Data Feed (CDF)

Capture row-level inserts/updates/deletes between versions.

```scala
// Enable on the table
spark.sql("ALTER TABLE delta.`/data/scores` SET TBLPROPERTIES (delta.enableChangeDataFeed = true)")

// Read changes between versions (adds _change_type, _commit_version, _commit_timestamp)
val changes = spark.read.format("delta")
  .option("readChangeFeed", "true")
  .option("startingVersion", 1)
  .load("/data/scores")
// _change_type ∈ {insert, update_preimage, update_postimage, delete}
```

## Streaming with Delta

A Delta table is both a streaming source and sink.

```scala
// Source: stream new commits out of a Delta table
val stream = spark.readStream.format("delta").load("/data/scores")

// Sink: write a stream into a Delta table (checkpoint required)
events.writeStream.format("delta")
  .outputMode("append")
  .option("checkpointLocation", "/chk/scores")
  .start("/data/scores")
```

`foreachBatch` + `MERGE` is the standard pattern for streaming upserts into Delta (idempotent on `batchId`).

## Convert Existing Parquet

```scala
DeltaTable.convertToDelta(spark, "parquet.`/data/legacy_parquet`")
// Partitioned source:
DeltaTable.convertToDelta(spark, "parquet.`/data/legacy`", "year INT, month INT")
```

## Common Mistakes

| Mistake | Fix |
|---|---|
| Missing `spark.sql.extensions` / `DeltaCatalog` config | Set both configs on the SparkSession or `delta` format won't resolve |
| Using `delta-core` artifact | Renamed to `delta-spark` since 3.0 (`io.delta:delta-spark_2.13`) |
| Mismatched Spark/Delta versions | Delta 4.2.0 ↔ Spark 4.1.x; check the compatibility before bumping |
| `VACUUM` then expecting old time-travel | VACUUM deletes old files; keep retention ≥ your time-travel window |
| Schema mismatch write fails unexpectedly | Add `mergeSchema`/`overwriteSchema` to opt into evolution |
| `updateAll()` with non-matching schemas | Use `updateExpr`/`insertExpr` for explicit column mapping |
| Many small files from streaming | Run `OPTIMIZE` (compaction) + Z-ORDER periodically |
