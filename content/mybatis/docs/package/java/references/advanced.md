# MyBatis Advanced Features

## TypeHandlers

Custom type conversion between Java and JDBC. Extend `BaseTypeHandler<T>` to handle non-standard mappings.

### Example: JSON List TypeHandler

```java
import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedJdbcTypes;
import org.apache.ibatis.type.MappedTypes;

@MappedJdbcTypes(JdbcType.VARCHAR)
@MappedTypes(List.class)
public class JsonListTypeHandler extends BaseTypeHandler<List<String>> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i,
            List<String> parameter, JdbcType jdbcType) throws SQLException {
        try {
            ps.setString(i, objectMapper.writeValueAsString(parameter));
        } catch (JsonProcessingException e) {
            throw new SQLException("Failed to serialize list", e);
        }
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, String columnName)
            throws SQLException {
        return parseJson(rs.getString(columnName));
    }

    @Override
    public List<String> getNullableResult(ResultSet rs, int columnIndex)
            throws SQLException {
        return parseJson(rs.getString(columnIndex));
    }

    @Override
    public List<String> getNullableResult(CallableStatement cs, int columnIndex)
            throws SQLException {
        return parseJson(cs.getString(columnIndex));
    }

    private List<String> parseJson(String json) throws SQLException {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json,
                objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            throw new SQLException("Failed to parse JSON list", e);
        }
    }
}
```

### Register Globally (mybatis-config.xml)

```xml
<typeHandlers>
  <typeHandler handler="com.example.handler.JsonListTypeHandler"/>
</typeHandlers>
```

### Register Per-Column (resultMap)

```xml
<result property="tags" column="tags"
        typeHandler="com.example.handler.JsonListTypeHandler"/>
```

### Register in Spring Boot (application.yml)

```yaml
mybatis:
  type-handlers-package: com.example.handler
```

## Interceptors (Plugins)

MyBatis interceptors can hook into four target objects:

| Target | Description |
|--------|-------------|
| `Executor` | Controls query/update execution, transaction, and caching |
| `ParameterHandler` | Sets parameters on PreparedStatement |
| `ResultSetHandler` | Handles ResultSet to object mapping |
| `StatementHandler` | Creates and configures Statement objects |

### Example: Slow Query Logger

```java
import org.apache.ibatis.executor.Executor;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.plugin.Interceptor;
import org.apache.ibatis.plugin.Intercepts;
import org.apache.ibatis.plugin.Invocation;
import org.apache.ibatis.plugin.Signature;
import org.apache.ibatis.session.ResultHandler;
import org.apache.ibatis.session.RowBounds;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Intercepts({
    @Signature(type = Executor.class, method = "query",
               args = {MappedStatement.class, Object.class,
                       RowBounds.class, ResultHandler.class})
})
public class SlowQueryInterceptor implements Interceptor {

    private static final Logger log =
        LoggerFactory.getLogger(SlowQueryInterceptor.class);
    private static final long THRESHOLD_MS = 1000;

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        long start = System.currentTimeMillis();
        Object result = invocation.proceed();
        long elapsed = System.currentTimeMillis() - start;
        if (elapsed > THRESHOLD_MS) {
            MappedStatement ms = (MappedStatement) invocation.getArgs()[0];
            log.warn("Slow query [{}ms]: {}", elapsed, ms.getId());
        }
        return result;
    }
}
```

### Register in mybatis-config.xml

```xml
<plugins>
  <plugin interceptor="com.example.plugin.SlowQueryInterceptor"/>
</plugins>
```

### Register as Spring Bean

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MyBatisConfig {

    @Bean
    public SlowQueryInterceptor slowQueryInterceptor() {
        return new SlowQueryInterceptor();
    }
}
```

## Common Third-Party Plugins

| Plugin | Purpose |
|--------|---------|
| PageHelper | Pagination (auto-rewrites SQL with LIMIT/OFFSET) |
| MyBatis-Plus | Enhanced CRUD, code generation, pagination, optimistic locking |
| tk.mybatis (Mapper) | Generic mapper interfaces to reduce boilerplate XML |
