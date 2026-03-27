---
name: snowpark-python
description: "Snowpark Python — DataFrame API, UDFs, stored procedures, and pandas on Snowflake for building data pipelines and ML workflows without moving data"
metadata:
  languages: "python"
  versions: "1.x"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "snowflake,snowpark,python,dataframe,udf,stored-procedure,pandas,ml,data-engineering"
---

# Snowpark Python

Snowpark provides a Python API for querying and processing data in Snowflake without moving data out of the platform. Build data pipelines, write UDFs, create stored procedures, and run pandas code directly on Snowflake compute.

## Setup

### Install

```bash
pip install snowflake-snowpark-python
```

### Create a Session

```python
from snowflake.snowpark import Session

connection_params = {
    "account": "myaccount",
    "user": "myuser",
    "password": "mypassword",
    "warehouse": "COMPUTE_WH",
    "database": "MYDB",
    "schema": "PUBLIC",
    "role": "DEVELOPER"
}

session = Session.builder.configs(connection_params).create()
```

Authentication supports password, key-pair, SSO (`externalbrowser`), OAuth, and programmatic access tokens.

## DataFrames

Snowpark DataFrames are lazily evaluated — transformations build a query plan that executes on Snowflake when you trigger an action.

### Basic Operations

```python
# Read a table
df = session.table("customers")

# Select, filter, aggregate
result = (
    df.select("name", "region", "revenue")
      .filter(df["revenue"] > 1000)
      .group_by("region")
      .agg(sum("revenue").alias("total_revenue"))
      .sort("total_revenue", ascending=False)
)

result.show()
```

### Joins

```python
orders = session.table("orders")
customers = session.table("customers")

joined = orders.join(customers, orders["customer_id"] == customers["id"])
joined.select("order_id", "name", "amount").show()
```

### Writing Data

```python
# Write DataFrame to a table
df.write.mode("overwrite").save_as_table("output_table")

# Append
df.write.mode("append").save_as_table("output_table")
```

### SQL Interop

```python
# Run raw SQL and get a DataFrame
df = session.sql("SELECT * FROM my_table WHERE date > '2024-01-01'")
df.show()
```

## User-Defined Functions (UDFs)

### Inline UDF

```python
from snowflake.snowpark.functions import udf
from snowflake.snowpark.types import StringType

@udf(name="categorize_amount", return_type=StringType(), replace=True)
def categorize_amount(amount: float) -> str:
    if amount > 10000:
        return "high"
    elif amount > 1000:
        return "medium"
    else:
        return "low"

# Use in a query
df = session.table("orders")
df.select("order_id", categorize_amount("amount").alias("category")).show()
```

### Vectorized UDF (Batch Processing)

```python
from snowflake.snowpark.functions import pandas_udf
from snowflake.snowpark.types import IntegerType
import pandas as pd

@pandas_udf(name="double_values", return_type=IntegerType(), replace=True)
def double_values(series: pd.Series) -> pd.Series:
    return series * 2
```

## User-Defined Table Functions (UDTFs)

```python
from snowflake.snowpark.functions import udtf
from snowflake.snowpark.types import StructType, StructField, StringType

@udtf(
    name="split_words",
    output_schema=StructType([StructField("word", StringType())]),
    replace=True
)
class SplitWords:
    def process(self, text: str):
        for word in text.split():
            yield (word,)

# Use it
session.table_function("split_words", lit("hello world")).show()
```

## Stored Procedures

```python
from snowflake.snowpark import Session

def process_data(session: Session, input_table: str, output_table: str) -> str:
    df = session.table(input_table)
    result = df.filter(df["status"] == "active").group_by("region").count()
    result.write.mode("overwrite").save_as_table(output_table)
    return f"Wrote {result.count()} rows to {output_table}"

# Register as stored procedure
session.sproc.register(
    func=process_data,
    name="process_data_sp",
    replace=True,
    packages=["snowflake-snowpark-python"]
)

# Call it
session.call("process_data_sp", "raw_customers", "processed_customers")
```

### Schedule as a Task

```sql
CREATE OR REPLACE TASK daily_processing
  WAREHOUSE = COMPUTE_WH
  SCHEDULE = 'USING CRON 0 6 * * * America/Los_Angeles'
AS
  CALL process_data_sp('raw_customers', 'processed_customers');
```

## pandas on Snowflake

Run pandas code that executes on Snowflake compute (not locally):

```python
import modin.pandas as pd
import snowflake.snowpark.modin.plugin

# Read from Snowflake
df = pd.read_snowflake("customers")

# Standard pandas operations — executed on Snowflake
result = df.groupby("region")["revenue"].mean()
result.to_snowflake("avg_revenue_by_region", if_exists="replace")
```

## Machine Learning

### Train Models with Stored Procedures

```python
from snowflake.snowpark import Session
from sklearn.linear_model import LogisticRegression
import pandas as pd

def train_model(session: Session) -> str:
    df = session.table("training_data").to_pandas()
    X = df[["feature1", "feature2", "feature3"]]
    y = df["label"]

    model = LogisticRegression()
    model.fit(X, y)

    # Save model to stage
    import joblib
    joblib.dump(model, "/tmp/model.pkl")
    session.file.put("/tmp/model.pkl", "@models", auto_compress=False, overwrite=True)
    return "Model trained and saved"

session.sproc.register(func=train_model, name="train_model_sp", replace=True,
    packages=["snowflake-snowpark-python", "scikit-learn", "joblib", "pandas"])
```

## File Operations

```python
# Upload to stage
session.file.put("local_file.csv", "@my_stage", auto_compress=False)

# Read from stage
df = session.read.csv("@my_stage/data.csv")
df = session.read.parquet("@my_stage/data.parquet")
df = session.read.json("@my_stage/data.json")
```

## Logging and Troubleshooting

```python
# View the generated SQL for any DataFrame
print(df.queries)

# Enable logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

Record log messages and trace events to an event table for production monitoring.

## Key Concepts

- **Lazy evaluation**: DataFrame transformations build a plan; actions (`.show()`, `.collect()`, `.save_as_table()`) trigger execution
- **Server-side execution**: UDFs and stored procedures run on Snowflake compute, not locally
- **pandas on Snowflake**: Uses Modin + Snowpark to push pandas operations to Snowflake
- **No data movement**: Data stays in Snowflake throughout the pipeline

## Prerequisites

- `pip install snowflake-snowpark-python`
- Python 3.9+ (3.10 for some features)
- Snowflake account with appropriate roles and warehouse access
- For pandas on Snowflake: `pip install "snowflake-snowpark-python[modin]"`
