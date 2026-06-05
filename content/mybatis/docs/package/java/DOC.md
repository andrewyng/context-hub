---
name: package
description: "MyBatis 3.5.16 persistence framework guide for Java, covering configuration, mappers, dynamic SQL, result mapping, and caching"
metadata:
  languages: "java"
  versions: "3.5.16"
  revision: 1
  updated-on: "2026-03-17"
  source: community
  tags: "mybatis,orm,sql,database,java,mapper,xml"
---

# MyBatis 3 Java Package Guide

## What It Is

MyBatis is a persistence framework for Java that maps SQL statements to Java methods. Unlike full ORMs (Hibernate/JPA), MyBatis gives you direct control over SQL while eliminating boilerplate JDBC code.

Use this doc when you need to:

- map SQL queries to Java interfaces without writing JDBC boilerplate
- build dynamic SQL with conditional fragments (if/choose/foreach)
- map complex result sets to nested Java objects
- integrate MyBatis with Spring or Spring Boot

## Install

### Maven

```xml
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>3.5.16</version>
</dependency>
```

### Spring Boot Starter

```xml
<dependency>
  <groupId>org.mybatis.spring.boot</groupId>
  <artifactId>mybatis-spring-boot-starter</artifactId>
  <version>3.0.3</version>
</dependency>
```

### Gradle

```groovy
implementation 'org.mybatis:mybatis:3.5.16'
// or with Spring Boot
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.3'
```

You also need a JDBC driver for your database:

```xml
<!-- MySQL -->
<dependency>
  <groupId>com.mysql</groupId>
  <artifactId>mysql-connector-j</artifactId>
  <version>8.3.0</version>
</dependency>

<!-- PostgreSQL -->
<dependency>
  <groupId>org.postgresql</groupId>
  <artifactId>postgresql</artifactId>
  <version>42.7.3</version>
</dependency>
```

## Configuration

### Standalone (mybatis-config.xml)

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
  <settings>
    <setting name="mapUnderscoreToCamelCase" value="true"/>
    <setting name="useGeneratedKeys" value="true"/>
    <setting name="defaultExecutorType" value="REUSE"/>
    <setting name="logImpl" value="SLF4J"/>
  </settings>
  <typeAliases>
    <package name="com.example.model"/>
  </typeAliases>
  <environments default="development">
    <environment id="development">
      <transactionManager type="JDBC"/>
      <dataSource type="POOLED">
        <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
        <property name="username" value="root"/>
        <property name="password" value=""/>
      </dataSource>
    </environment>
  </environments>
  <mappers>
    <package name="com.example.mapper"/>
  </mappers>
</configuration>
```

### Building and Using SqlSessionFactory

```java
import java.io.InputStream;

import org.apache.ibatis.io.Resources;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;

String resource = "mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory =
    new SqlSessionFactoryBuilder().build(inputStream);

// Use SqlSession to execute queries
try (SqlSession session = sqlSessionFactory.openSession()) {
    UserMapper mapper = session.getMapper(UserMapper.class);
    User user = mapper.selectById(1L);
}

// With write operations, commit explicitly
try (SqlSession session = sqlSessionFactory.openSession()) {
    UserMapper mapper = session.getMapper(UserMapper.class);
    User newUser = new User();
    newUser.setUserName("alice");
    newUser.setEmail("alice@example.com");
    newUser.setAge(25);
    mapper.insert(newUser);
    session.commit();
}
```

### Spring Boot (application.yml)

```yaml
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.example.model
  configuration:
    map-underscore-to-camel-case: true
    use-generated-keys: true
    default-executor-type: reuse
    log-impl: org.apache.ibatis.logging.slf4j.Slf4jImpl
```

Add `@MapperScan` to your application class:

```java
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

## Key Settings Reference

| Setting | Default | Description |
|---------|---------|-------------|
| `mapUnderscoreToCamelCase` | `false` | Auto-map `user_name` column to `userName` field |
| `useGeneratedKeys` | `false` | Allow JDBC auto-generated keys |
| `defaultExecutorType` | `SIMPLE` | `SIMPLE`, `REUSE` (reuses PreparedStatements), `BATCH` |
| `lazyLoadingEnabled` | `false` | Enable lazy loading for associations |
| `cacheEnabled` | `true` | Enable/disable second-level cache globally |
| `logImpl` | not set | `SLF4J`, `LOG4J2`, `STDOUT_LOGGING`, etc. |

## Mapper Interfaces and XML

### Define a Model

```java
import java.time.LocalDateTime;

public class User {
    private Long id;
    private String userName;
    private String email;
    private Integer age;
    private LocalDateTime createdAt;

    // getters and setters
}
```

### Define a Mapper Interface

```java
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    User selectById(Long id);
    List<User> selectAll();
    List<User> selectByAge(@Param("minAge") int minAge, @Param("maxAge") int maxAge);
    int insert(User user);
    int update(User user);
    int deleteById(Long id);
}
```

### Mapper XML (UserMapper.xml)

Place in `resources/mapper/UserMapper.xml` (or matching the mapper-locations config):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
  PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">

  <resultMap id="userResultMap" type="User">
    <id property="id" column="id"/>
    <result property="userName" column="user_name"/>
    <result property="email" column="email"/>
    <result property="age" column="age"/>
    <result property="createdAt" column="created_at"/>
  </resultMap>

  <sql id="userCols">id, user_name, email, age, created_at</sql>

  <select id="selectById" resultMap="userResultMap">
    SELECT <include refid="userCols"/> FROM users WHERE id = #{id}
  </select>

  <select id="selectAll" resultMap="userResultMap">
    SELECT <include refid="userCols"/> FROM users
  </select>

  <select id="selectByAge" resultMap="userResultMap">
    SELECT <include refid="userCols"/> FROM users
    WHERE age BETWEEN #{minAge} AND #{maxAge}
  </select>

  <insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO users (user_name, email, age, created_at)
    VALUES (#{userName}, #{email}, #{age}, #{createdAt})
  </insert>

  <update id="update">
    UPDATE users
    SET user_name = #{userName}, email = #{email}, age = #{age}
    WHERE id = #{id}
  </update>

  <delete id="deleteById">
    DELETE FROM users WHERE id = #{id}
  </delete>

</mapper>
```

### Parameter Passing Rules

- **Single parameter**: use `#{value}` or any name — `#{id}`, `#{param1}`
- **Multiple parameters**: use `@Param("name")` annotation, then `#{name}` in XML. (MyBatis 3.4.1+ auto-detects names with `-parameters` compiler flag, but `@Param` is safer.)
- **Object parameter**: use property names directly — `#{userName}`, `#{email}`
- **Map parameter**: use map keys — `#{key}`

**`#{}` vs `${}`**:
- `#{}` — PreparedStatement parameter (safe, prevents SQL injection). Always prefer this.
- `${}` — String substitution (unsafe, vulnerable to SQL injection). Only use for dynamic table/column names where `#{}` is not allowed.

## Annotation-Based Mapping

For simple queries, you can use annotations instead of XML. Do not mix both for the same mapper method.

```java
import java.util.List;

import org.apache.ibatis.annotations.*;

@Mapper
public interface UserAnnotationMapper {

    @Select("SELECT * FROM users WHERE id = #{id}")
    User selectById(Long id);

    @Insert("INSERT INTO users (user_name, email, age) VALUES (#{userName}, #{email}, #{age})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);

    @Update("UPDATE users SET user_name = #{userName}, email = #{email} WHERE id = #{id}")
    int update(User user);

    @Delete("DELETE FROM users WHERE id = #{id}")
    int deleteById(Long id);

    @Select("SELECT * FROM users WHERE age >= #{minAge} AND age <= #{maxAge}")
    List<User> selectByAgeRange(@Param("minAge") int minAge, @Param("maxAge") int maxAge);
}
```

Use annotations for simple CRUD. Use XML for dynamic SQL, complex result mappings, and multi-line queries.

## Dynamic SQL

### if

```xml
<select id="findUsers" resultMap="userResultMap">
  SELECT * FROM users
  <where>
    <if test="userName != null and userName != ''">
      AND user_name LIKE CONCAT('%', #{userName}, '%')
    </if>
    <if test="email != null">
      AND email = #{email}
    </if>
    <if test="age != null">
      AND age = #{age}
    </if>
  </where>
</select>
```

The `<where>` tag automatically strips the leading `AND`/`OR` and only adds `WHERE` if at least one condition is true.

### choose / when / otherwise

```xml
<select id="findUsersOrdered" resultMap="userResultMap">
  SELECT * FROM users
  ORDER BY
  <choose>
    <when test="orderBy == 'name'">user_name</when>
    <when test="orderBy == 'age'">age</when>
    <otherwise>id</otherwise>
  </choose>
</select>
```

### foreach

```xml
<select id="selectByIds" resultMap="userResultMap">
  SELECT * FROM users
  WHERE id IN
  <foreach item="id" collection="ids" open="(" separator="," close=")">
    #{id}
  </foreach>
</select>
```

Mapper method signature:

```java
List<User> selectByIds(@Param("ids") List<Long> ids);
```

### set (for dynamic updates)

```xml
<update id="updateSelective">
  UPDATE users
  <set>
    <if test="userName != null">user_name = #{userName},</if>
    <if test="email != null">email = #{email},</if>
    <if test="age != null">age = #{age},</if>
  </set>
  WHERE id = #{id}
</update>
```

The `<set>` tag strips trailing commas automatically.

### trim

`<where>` and `<set>` are shortcuts for `<trim>`. Use `<trim>` when you need custom prefix/suffix stripping:

```xml
<trim prefix="WHERE" prefixOverrides="AND |OR ">...</trim>  <!-- equivalent to <where> -->
<trim prefix="SET" suffixOverrides=",">...</trim>            <!-- equivalent to <set> -->
```

### Batch Insert

```xml
<insert id="batchInsert">
  INSERT INTO users (user_name, email, age)
  VALUES
  <foreach item="user" collection="users" separator=",">
    (#{user.userName}, #{user.email}, #{user.age})
  </foreach>
</insert>
```

## Result Mapping

### One-to-One Association

Given `Order` has a `User user` field and `User` has a `List<Order> orders` field:

```xml
<resultMap id="orderWithUser" type="Order">
  <id property="id" column="order_id"/>
  <result property="amount" column="amount"/>
  <association property="user" javaType="User">
    <id property="id" column="user_id"/>
    <result property="userName" column="user_name"/>
    <result property="email" column="email"/>
  </association>
</resultMap>

<select id="selectOrderWithUser" resultMap="orderWithUser">
  SELECT o.id AS order_id, o.amount, u.id AS user_id, u.user_name, u.email
  FROM orders o
  JOIN users u ON o.user_id = u.id
  WHERE o.id = #{id}
</select>
```

### One-to-Many Collection

```xml
<resultMap id="userWithOrders" type="User">
  <id property="id" column="user_id"/>
  <result property="userName" column="user_name"/>
  <collection property="orders" ofType="Order">
    <id property="id" column="order_id"/>
    <result property="amount" column="amount"/>
  </collection>
</resultMap>

<select id="selectUserWithOrders" resultMap="userWithOrders">
  SELECT u.id AS user_id, u.user_name,
         o.id AS order_id, o.amount
  FROM users u
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.id = #{id}
</select>
```

### Nested Select (N+1 — use with caution)

Use `select=` attribute on `<collection>` or `<association>` to trigger a separate query. This causes N+1 queries — prefer JOIN-based mapping unless you specifically need lazy loading with `fetchType="lazy"`.

## Caching

### First-Level Cache (Session Cache)

Enabled by default per `SqlSession`. Same query within the same session returns the cached object. Cleared on `commit()`, `rollback()`, or `close()`.

### Second-Level Cache (Mapper Cache)

Add to mapper XML:

```xml
<cache eviction="LRU" flushInterval="60000" size="512" readOnly="true"/>
```

Requirements:
- Model class must implement `Serializable` (unless `readOnly="true"`)
- All `select` in the mapper will be cached; any `insert`/`update`/`delete` flushes the entire mapper cache
- Cross-mapper cache dependencies need `<cache-ref namespace="..."/>`

**Caution**: Second-level cache is mapper-scoped. If two mappers query the same table and one updates it, the other's cache becomes stale. For Spring Boot apps, prefer `@Cacheable` instead.

## Common Pitfalls

1. **`#{}` vs `${}`**: Always use `#{}`. Only use `${}` for dynamic table/column names that cannot be parameterized, and validate input manually.

2. **Forgetting `@Param` with multiple parameters**: Without `@Param`, MyBatis names them `param1`, `param2` — explicit names are clearer and less error-prone.

3. **N+1 queries with nested selects**: Prefer JOIN-based `<association>`/`<collection>` over `select=` attribute unless lazy loading is specifically needed.

4. **Second-level cache across mappers**: If multiple mappers touch the same table, cache inconsistency will occur. Use `<cache-ref>` or avoid second-level cache for those mappers.

5. **Null checks in dynamic SQL**: `<if test="name != null">` does not check empty strings. Use `<if test="name != null and name != ''">` for String parameters.

6. **Batch `<foreach>` exceeding max_allowed_packet**: Split large batch inserts into chunks of 500-1000 rows.

7. **Integer 0 vs null in `<if>`**: `<if test="status != null and status != ''">` fails for `status = 0` because OGNL treats `0 == ''` as true. For numeric fields, only check `!= null`.

For TypeHandlers and Interceptors (Plugins), see [references/advanced.md](references/advanced.md).

## Official Sources

- MyBatis 3 documentation: `https://mybatis.org/mybatis-3/`
- MyBatis GitHub: `https://github.com/mybatis/mybatis-3`
- MyBatis Spring / Spring Boot Starter: `https://mybatis.org/spring-boot-starter/`
- Maven Central: `https://central.sonatype.com/artifact/org.mybatis/mybatis`
