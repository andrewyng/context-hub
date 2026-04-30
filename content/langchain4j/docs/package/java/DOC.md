---
name: package
description: "LangChain4j Java SDK for LLM integration with Spring Boot, chat models, tool use, RAG, embedding, and structured output"
metadata:
  languages: "java"
  versions: "1.1.0"
  revision: 1
  updated-on: "2026-03-24"
  source: community
  tags: "langchain4j,java,llm,spring-boot,rag,tools,embeddings,ai"
---

# LangChain4j — Java LLM Integration Guide

## CRITICAL: Common Agent Mistakes
- Do NOT use LangChain (Python) APIs in Java — LangChain4j has its own API surface
- Do NOT manually construct HTTP calls to OpenAI/Anthropic — use LangChain4j model abstractions
- Do NOT confuse `langchain4j` core with `langchain4j-spring-boot-starter` — both are needed for Spring Boot
- Do NOT use `langchain4j-spring-boot-starter` 1.0.x — it has breaking changes from 1.1.x
- The Spring Boot starters are still in beta (`1.1.0-beta7`) — version may differ from core
- Do NOT use `ChatModel` — renamed to `ChatModel` in 1.0 GA
- Do NOT use `.generate()` — renamed to `.chat()` in 1.0 GA
- Do NOT use `Response<AiMessage>` — replaced by `ChatResponse`

## Dependencies

### Maven (BOM recommended)
```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-bom</artifactId>
            <version>1.1.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Core -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
    </dependency>

    <!-- OpenAI provider -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai</artifactId>
    </dependency>

    <!-- Spring Boot integration -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-spring-boot-starter</artifactId>
        <version>1.1.0-beta7</version>
    </dependency>
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai-spring-boot-starter</artifactId>
        <version>1.1.0-beta7</version>
    </dependency>
</dependencies>
```

### Gradle (Kotlin DSL)
```kotlin
implementation(platform("dev.langchain4j:langchain4j-bom:1.1.0"))
implementation("dev.langchain4j:langchain4j")
implementation("dev.langchain4j:langchain4j-open-ai")
implementation("dev.langchain4j:langchain4j-spring-boot-starter:1.1.0-beta7")
implementation("dev.langchain4j:langchain4j-open-ai-spring-boot-starter:1.1.0-beta7")
```

## Spring Boot Auto-Configuration

### application.yml
```yaml
langchain4j:
  open-ai:
    chat-model:
      api-key: ${OPENAI_API_KEY}
      model-name: gpt-4o-mini
      temperature: 0.3
      max-tokens: 4096
      timeout: PT60S
      log-requests: true
      log-responses: true
    embedding-model:
      api-key: ${OPENAI_API_KEY}
      model-name: text-embedding-3-small
```

### Available Providers
| Provider | Starter Artifact |
|---|---|
| OpenAI | `langchain4j-open-ai-spring-boot-starter` |
| Anthropic | `langchain4j-anthropic-spring-boot-starter` |
| Azure OpenAI | `langchain4j-azure-open-ai-spring-boot-starter` |
| Google Vertex AI | `langchain4j-vertex-ai-gemini-spring-boot-starter` |
| Ollama (local) | `langchain4j-ollama-spring-boot-starter` |
| Mistral AI | `langchain4j-mistral-ai-spring-boot-starter` |

## Chat Models

### Basic Chat
```java
@Service
public class ChatService {

    private final ChatModel chatModel;

    public ChatService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String ask(String question) {
        return chatModel.chat(question);
    }

    public String askWithSystem(String systemPrompt, String userInput) {
        ChatResponse response = chatModel.chat(
            SystemMessage.from(systemPrompt),
            UserMessage.from(userInput)
        );
        return response.aiMessage().text();
    }
}
```

### Streaming Chat
```java
@Service
public class StreamingChatService {

    private final StreamingChatModel streamingModel;

    public StreamingChatService(StreamingChatModel streamingModel) {
        this.streamingModel = streamingModel;
    }

    public Flux<String> streamResponse(String question) {
        return Flux.create(sink -> {
            streamingModel.chat(question, new StreamingChatResponseHandler() {
                @Override
                public void onPartialResponse(String token) {
                    sink.next(token);
                }

                @Override
                public void onCompleteResponse(ChatResponse response) {
                    sink.complete();
                }

                @Override
                public void onError(Throwable error) {
                    sink.error(error);
                }
            });
        });
    }
}
```

## AI Services (Declarative Interface)

The most powerful LangChain4j feature — define an interface, LangChain4j implements it.

```java
public interface AssistantService {

    @SystemMessage("You are a helpful assistant specializing in {{topic}}")
    String chat(@V("topic") String topic, @UserMessage String question);

    @SystemMessage("Summarize the following text in {{maxSentences}} sentences")
    String summarize(@V("maxSentences") int maxSentences, @UserMessage String text);
}
```

### Register as Spring Bean
```java
@Configuration
public class AiConfig {

    @Bean
    public AssistantService assistantService(ChatModel chatModel) {
        return AiServices.builder(AssistantService.class)
            .chatModel(chatModel)
            .build();
    }
}
```

### AI Service with Memory
```java
@Bean
public AssistantService assistantService(ChatModel chatModel) {
    return AiServices.builder(AssistantService.class)
        .chatModel(chatModel)
        .chatMemory(MessageWindowChatMemory.withMaxMessages(20))
        .build();
}
```

## Tool Use (Function Calling)

### Define Tools
```java
@Component
public class OrderTools {

    private final OrderRepository orderRepository;

    public OrderTools(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Tool("Look up an order by its ID and return the order details")
    public String getOrder(@P("The order ID to look up") Long orderId) {
        return orderRepository.findById(orderId)
            .map(Order::toString)
            .orElse("Order not found with ID: " + orderId);
    }

    @Tool("Search orders by customer name")
    public String searchOrders(@P("Customer name to search for") String customerName) {
        List<Order> orders = orderRepository.findByCustomerNameContainingIgnoreCase(customerName);
        return orders.isEmpty() ? "No orders found" : orders.toString();
    }

    @Tool("Cancel an order if it is in PENDING status")
    public String cancelOrder(@P("The order ID to cancel") Long orderId) {
        // Tool implementation
        return orderRepository.findById(orderId)
            .filter(o -> o.getStatus() == OrderStatus.PENDING)
            .map(o -> { o.setStatus(OrderStatus.CANCELLED); orderRepository.save(o); return "Cancelled"; })
            .orElse("Cannot cancel — order not found or not in PENDING status");
    }
}
```

### Wire Tools into AI Service
```java
@Bean
public AssistantService assistantService(ChatModel chatModel, OrderTools orderTools) {
    return AiServices.builder(AssistantService.class)
        .chatModel(chatModel)
        .tools(orderTools)
        .chatMemory(MessageWindowChatMemory.withMaxMessages(20))
        .build();
}
```

**CRITICAL**: Tool descriptions matter — the LLM reads them to decide when to call each tool. Be specific and include parameter descriptions with `@P`.

## Structured Output (JSON extraction)

```java
public record PersonInfo(
    String name,
    int age,
    String email,
    List<String> hobbies
) {}

public interface ExtractorService {

    @UserMessage("Extract person information from: {{text}}")
    PersonInfo extractPerson(@V("text") String text);

    @UserMessage("Classify the sentiment of: {{text}}")
    Sentiment classifySentiment(@V("text") String text);
}

enum Sentiment { POSITIVE, NEGATIVE, NEUTRAL }
```

LangChain4j handles JSON schema generation and parsing automatically.

## RAG (Retrieval Augmented Generation)

### Embedding and Storing
```java
@Service
public class DocumentIngestionService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    public DocumentIngestionService(EmbeddingModel embeddingModel,
                                     EmbeddingStore<TextSegment> embeddingStore) {
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
    }

    public void ingest(String text, Map<String, String> metadata) {
        Document document = Document.from(text, Metadata.from(metadata));
        DocumentSplitter splitter = DocumentSplitters.recursive(500, 50);
        List<TextSegment> segments = splitter.split(document);

        List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
        embeddingStore.addAll(embeddings, segments);
    }
}
```

### RAG with AI Service
```java
@Bean
public AssistantService ragAssistant(ChatModel chatModel,
                                      EmbeddingModel embeddingModel,
                                      EmbeddingStore<TextSegment> embeddingStore) {
    ContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
        .embeddingStore(embeddingStore)
        .embeddingModel(embeddingModel)
        .maxResults(5)
        .minScore(0.7)
        .build();

    return AiServices.builder(AssistantService.class)
        .chatModel(chatModel)
        .contentRetriever(retriever)
        .build();
}
```

### Embedding Store Providers
| Store | Artifact |
|---|---|
| In-Memory | `langchain4j` (built-in) |
| PostgreSQL/pgvector | `langchain4j-pgvector` |
| Pinecone | `langchain4j-pinecone` |
| Weaviate | `langchain4j-weaviate` |
| Chroma | `langchain4j-chroma` |
| Elasticsearch | `langchain4j-elasticsearch` |
| Redis | `langchain4j-redis` |

## Chat Memory Providers

```java
// Window-based: keeps last N messages
ChatMemory windowMemory = MessageWindowChatMemory.withMaxMessages(20);

// Token-based: keeps messages within token budget
ChatMemory tokenMemory = TokenWindowChatMemory.builder()
    .maxTokens(4000)
    .tokenizer(new OpenAiTokenizer("gpt-4o-mini"))
    .build();
```

### Per-User Memory (multi-tenant)
```java
@Bean
public AssistantService assistantService(ChatModel chatModel) {
    return AiServices.builder(AssistantService.class)
        .chatModel(chatModel)
        .chatMemoryProvider(userId ->
            MessageWindowChatMemory.builder()
                .id(userId)
                .maxMessages(20)
                .build())
        .build();
}
```

AI Service methods can accept `@MemoryId` to route to per-user memory:
```java
public interface AssistantService {
    String chat(@MemoryId String userId, @UserMessage String message);
}
```

## Common Mistakes

1. **Missing Spring Boot starter** — `langchain4j-open-ai` alone won't auto-configure. Add the `-spring-boot-starter` variant
2. **Wrong model name** — use `gpt-4o-mini` not `gpt-4-mini`, use `gpt-4o` not `gpt-4-turbo`
3. **Tool without description** — `@Tool` annotation MUST have a description string or the LLM won't know when to use it
4. **Shared ChatMemory across users** — use `chatMemoryProvider` with `@MemoryId` for multi-tenant apps
5. **Blocking on streaming model** — `StreamingChatModel` requires callback, don't call `.chat()` expecting a synchronous return
6. **Missing BOM** — without `langchain4j-bom`, version mismatches cause runtime errors
7. **Using old API names** — `ChatLanguageModel` is now `ChatModel`, `.generate()` is now `.chat()`, `Response<AiMessage>` is now `ChatResponse` (all renamed in 1.0 GA)
