---
name: package
description: "Spring Security 6.x SecurityFilterChain, OAuth2, JWT, method security, and CORS configuration"
metadata:
  languages: "java"
  versions: "6.4.3"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "spring-security,java,authentication,authorization,oauth2,jwt"
---

# Spring Security 6.x Guide

## CRITICAL: Deprecated/Removed APIs — Do NOT Use These
| REMOVED (Spring Security 6) | USE INSTEAD |
|---|---|
| `WebSecurityConfigurerAdapter` | `SecurityFilterChain` @Bean |
| `authorizeRequests()` | `authorizeHttpRequests()` |
| `antMatchers()` | `requestMatchers()` |
| `mvcMatchers()` | `requestMatchers()` |
| `regexMatchers()` | `requestMatchers()` with regex |
| `access("hasRole('ADMIN')")` | `.hasRole("ADMIN")` (method reference) |
| `and()` chaining | Lambda DSL (default in 6.x) |
| `csrf().disable()` | `csrf(csrf -> csrf.disable())` |
| `cors().and()` | `cors(cors -> cors.configurationSource(...))` |

## Basic SecurityFilterChain

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**", "/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/users").hasAuthority("USER_CREATE")
                .anyRequest().authenticated()
            )
            .httpBasic(Customizer.withDefaults())
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## UserDetailsService Implementation

```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())  // must be already BCrypt encoded
            .roles(user.getRoles().toArray(new String[0]))
            .build();
    }
}
```

## JWT Authentication

### JWT Filter
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider,
                                    UserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            var authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
```

### SecurityFilterChain with JWT
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http,
                                        JwtAuthenticationFilter jwtFilter) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

## OAuth2 Resource Server (JWT)

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.example.com/
          # OR use jwk-set-uri directly:
          # jwk-set-uri: https://auth.example.com/.well-known/jwks.json
```

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated()
        )
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(Customizer.withDefaults())
        )
        .build();
}
```

### Custom JWT Claims Extraction
```java
@Bean
public JwtAuthenticationConverter jwtAuthenticationConverter() {
    JwtGrantedAuthoritiesConverter grantedAuthorities = new JwtGrantedAuthoritiesConverter();
    grantedAuthorities.setAuthoritiesClaimName("roles");
    grantedAuthorities.setAuthorityPrefix("ROLE_");

    JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
    converter.setJwtGrantedAuthoritiesConverter(grantedAuthorities);
    return converter;
}
```

## Method-Level Security

```java
@Configuration
@EnableMethodSecurity  // NOT @EnableGlobalMethodSecurity (deprecated)
public class MethodSecurityConfig {}
```

```java
@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public Order getOrder(Long userId, Long orderId) { ... }

    @PreAuthorize("hasAuthority('ORDER_CREATE')")
    public Order createOrder(OrderRequest request) { ... }

    @PostAuthorize("returnObject.userId == authentication.principal.id")
    public Order findOrder(Long orderId) { ... }
}
```

## CORS Configuration

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("https://myapp.com", "http://localhost:3000"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return source;
}

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .build();
}
```

## CSRF Handling

### When to Disable CSRF
- Stateless REST APIs with JWT/token auth → **disable**
- Server-rendered forms with sessions → **keep enabled**
- SPAs with cookie-based auth → use `CookieCsrfTokenRepository`

```java
// SPA with cookie-based CSRF
.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
)
```

## Multiple SecurityFilterChain (Order Matters)

```java
@Bean
@Order(1)
public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
    return http
        .securityMatcher("/api/**")
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
        .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
        .build();
}

@Bean
@Order(2)
public SecurityFilterChain webFilterChain(HttpSecurity http) throws Exception {
    return http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/login", "/css/**", "/js/**").permitAll()
            .anyRequest().authenticated()
        )
        .formLogin(Customizer.withDefaults())
        .build();
}
```

Lower `@Order` value = higher priority. The first matching `securityMatcher` wins.

## Common Mistakes
1. **Using `authorizeRequests()`** — removed. Use `authorizeHttpRequests()`
2. **Using `antMatchers()`** — removed. Use `requestMatchers()`
3. **Forgetting `@EnableMethodSecurity`** — `@PreAuthorize` won't work without it
4. **Not setting `SessionCreationPolicy.STATELESS`** for JWT APIs — causes session creation overhead
5. **BCrypt: encoding at registration** — always encode passwords before saving: `passwordEncoder.encode(rawPassword)`
