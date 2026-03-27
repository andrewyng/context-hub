---
name: snowflake-notebooks
description: "Snowflake Notebooks — interactive cell-based development environment for SQL, Python, and Markdown with Snowpark integration, ML workflows, and scheduled pipelines"
metadata:
  languages: "sql,python"
  versions: "2026-03"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "snowflake,notebooks,python,sql,data-science,ml,snowpark,visualization,pipelines"
---

# Snowflake Notebooks

Snowflake Notebooks is an interactive, cell-based development environment in Snowsight for SQL, Python, and Markdown. Build data pipelines, train ML models, create visualizations, and schedule automated workflows — all on Snowflake compute.

## Key Features

- **Multi-language cells**: SQL, Python, and Markdown in the same notebook
- **Cross-cell references**: Use SQL results in Python cells and vice versa
- **Built-in visualizations**: Streamlit, Altair, Matplotlib, seaborn
- **Git integration**: Sync notebooks with Git repositories (Preview)
- **Scheduling**: Run notebooks as automated tasks on a schedule (Preview)
- **Role-based access**: Leverage Snowflake RBAC for collaboration
- **File uploads**: Load data from local files, cloud storage, or Snowflake Marketplace

## Notebook Runtimes

| Feature | Warehouse Runtime | Container Runtime |
|---------|-------------------|-------------------|
| Compute | Notebook warehouse | Compute pool node |
| Python version | 3.9, 3.10 (Preview) | 3.10 |
| Base image | Streamlit + Snowpark | Container Runtime (CPU/GPU with pre-installed ML packages) |
| Package install | Snowflake Anaconda or stage | pip, conda, or stage |
| Best for | SQL analytics, Snowpark | ML, deep learning, custom packages |

Both runtimes execute SQL and Snowpark queries on the warehouse.

### Choose Warehouse Runtime When

- Doing SQL analytics and data engineering
- Using Snowpark DataFrames and UDFs
- Standard Python packages available in Snowflake Anaconda suffice

### Choose Container Runtime When

- Training ML/deep learning models (GPU support)
- Need custom pip/conda packages not in Anaconda
- Running compute-intensive Python workloads

## Getting Started

### Create a Notebook

1. Sign in to Snowsight
2. Navigate to **Projects → Notebooks** (Legacy) or **Projects → Workspaces** (New)
3. Select **+ Notebook**
4. Choose a database, schema, warehouse, and runtime

### Cell Types

**SQL Cell**:
```sql
-- Results available as a DataFrame in Python cells
SELECT region, SUM(revenue) AS total_revenue
FROM sales
GROUP BY region
ORDER BY total_revenue DESC;
```

**Python Cell**:
```python
# Reference SQL cell results
import streamlit as st

# cell1 refers to the SQL cell above
df = cell1.to_pandas()
st.bar_chart(df.set_index("REGION"))
```

**Markdown Cell**:
```markdown
## Analysis Summary
Key findings from the revenue analysis...
```

### Cross-Cell References

SQL cell results are automatically available as Snowpark DataFrames in Python cells:

```python
# If a SQL cell named "revenue_query" exists:
df = revenue_query.to_pandas()
print(df.head())
```

Python variables can be referenced in SQL cells:

```sql
-- Reference Python variable
SELECT * FROM my_table WHERE date > '{{start_date}}'
```

## Python Packages

### Warehouse Runtime

```python
# Use the package selector in the toolbar, or:
# Install from Snowflake Anaconda channel
# Available packages: pandas, numpy, scikit-learn, matplotlib, seaborn, etc.
```

### Container Runtime

```python
!pip install transformers torch
```

## Visualizations

### Streamlit (Built-in)

```python
import streamlit as st

st.title("Sales Dashboard")
st.bar_chart(df)
st.line_chart(df.set_index("date")["revenue"])
st.dataframe(df)
```

### Matplotlib / Seaborn

```python
import matplotlib.pyplot as plt
import seaborn as sns

fig, ax = plt.subplots()
sns.barplot(data=df, x="region", y="revenue", ax=ax)
st.pyplot(fig)
```

### Altair

```python
import altair as alt

chart = alt.Chart(df).mark_bar().encode(x="region", y="revenue")
st.altair_chart(chart)
```

## ML Workflows

### Training with scikit-learn

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Get data from SQL cell
df = training_data.to_pandas()
X = df[["feature1", "feature2", "feature3"]]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)

accuracy = accuracy_score(y_test, model.predict(X_test))
st.metric("Model Accuracy", f"{accuracy:.2%}")
```

### Using Snowpark ML

```python
from snowflake.ml.modeling.ensemble import RandomForestClassifier as SnowRF

model = SnowRF(input_cols=["F1", "F2", "F3"], label_cols=["LABEL"])
model.fit(snowpark_df)
predictions = model.predict(test_df)
```

## Scheduling

Run notebooks on a schedule as Snowflake tasks:

1. Select the **Scheduler** icon in the notebook toolbar
2. Set a CRON schedule (e.g., daily at 6 AM)
3. The notebook runs as a task using the notebook's warehouse

```sql
-- Or create via SQL
CREATE OR REPLACE TASK run_etl_notebook
  WAREHOUSE = COMPUTE_WH
  SCHEDULE = 'USING CRON 0 6 * * * America/Los_Angeles'
AS
  EXECUTE NOTEBOOK mydb.myschema.etl_notebook;
```

## Notebooks in Workspaces (New)

The next generation of Snowflake Notebooks lives in **Workspaces** with:
- Full Jupyter compatibility
- Workspace integration alongside SQL files, Python files, and dbt projects
- Enhanced collaboration features

Legacy Notebooks will be migrated to Workspaces over the coming quarters.

## Toolbar Controls

| Control | Description |
|---------|-------------|
| **Package selector** | Install Python packages |
| **Start / Active** | Start session or view session details |
| **Run All / Stop** | Execute all cells or stop execution |
| **Scheduler** | Set automated run schedule |
| **Collapse results** | Toggle code/output visibility |

## Git Integration (Preview)

Sync notebooks with a Git repository for version control:

1. Connect your Git provider in Snowsight
2. Link the notebook to a repository
3. Push/pull changes to keep notebooks in sync

## Prerequisites

- Snowflake account with access to Snowsight
- Warehouse for compute (Warehouse Runtime) or compute pool (Container Runtime)
- Appropriate role with CREATE NOTEBOOK privileges
- For Container Runtime: SPCS compute pool configured
