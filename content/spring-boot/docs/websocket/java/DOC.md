---
name: spring-boot-websocket
description: "Spring Boot 4.0.x WebSocket — STOMP messaging, SockJS fallback, real-time notifications, chat, and security integration"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-websocket,websocket,stomp,sockjs,real-time,chat,notifications"
---

# Spring Boot WebSocket for 4.0.x

## What This Covers

Real-time communication with Spring Boot 4.0.x — WebSocket with STOMP protocol, SockJS fallback, message broadcasting, user-specific messaging, and Spring Security integration.

- Starter: `spring-boot-starter-websocket`
- Protocol: STOMP over WebSocket (recommended) or raw WebSocket
- Docs: `https://docs.spring.io/spring-boot/reference/messaging/websockets.html`

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

## WebSocket Configuration (STOMP + SockJS)

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Messages FROM server TO client will have these prefixes
        registry.enableSimpleBroker("/topic", "/queue");
        // Messages FROM client TO server will have this prefix
        registry.setApplicationDestinationPrefixes("/app");
        // User-specific destination prefix
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOrigins("https://myapp.com")
            .withSockJS(); // SockJS fallback for browsers without WebSocket
    }
}
```

## Message Controller

```java
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    // Client sends to /app/chat.send → broadcast to /topic/chat
    @MessageMapping("/chat.send")
    @SendTo("/topic/chat")
    public ChatMessage sendMessage(ChatMessage message) {
        return message;
    }

    // Room-based: /app/chat.room.123 → /topic/room/123
    @MessageMapping("/chat.room.{roomId}")
    @SendTo("/topic/room/{roomId}")
    public ChatMessage sendToRoom(@DestinationVariable String roomId,
                                   ChatMessage message) {
        message.setRoom(roomId);
        return message;
    }
}
```

```java
public class ChatMessage {
    private String sender;
    private String content;
    private String room;
    private String timestamp;

    // constructors, getters, setters
}
```

## Sending Messages from Service Layer

```java
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Broadcast to all subscribers of /topic/notifications
    public void broadcastNotification(Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    // Send to specific user's /queue/notifications
    public void sendToUser(String username, Notification notification) {
        messagingTemplate.convertAndSendToUser(
            username, "/queue/notifications", notification);
    }
}
```

## Client-Side (JavaScript)

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const client = new Client({
    webSocketFactory: () => new SockJS('https://myapp.com/ws'),
    onConnect: () => {
        // Subscribe to broadcast
        client.subscribe('/topic/chat', (message) => {
            const chatMessage = JSON.parse(message.body);
            console.log('Received:', chatMessage);
        });

        // Subscribe to user-specific messages
        client.subscribe('/user/queue/notifications', (message) => {
            const notification = JSON.parse(message.body);
            console.log('Notification:', notification);
        });

        // Send a message
        client.publish({
            destination: '/app/chat.send',
            body: JSON.stringify({ sender: 'Alice', content: 'Hello!' })
        });
    }
});

client.activate();
```

## WebSocket Security

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;

@Configuration
@EnableWebSocketSecurity
public class WebSocketSecurityConfig {
    // CSRF is enabled by default for WebSocket in Spring Security
    // Authentication is inherited from HTTP security
}
```

Or manual interceptor approach:

```java
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
        @Override
        public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization");
                // validate JWT token here
            }
            return message;
        }
    });
}
```

## Connection Events

```java
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        log.info("New WebSocket connection: {}",
            StompHeaderAccessor.wrap(event.getMessage()).getSessionId());
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        log.info("WebSocket disconnected: {}", event.getSessionId());
    }
}
```

## Common Mistakes

1. **Not using SockJS fallback** — some corporate proxies/firewalls block WebSocket; SockJS provides HTTP fallback
2. **Missing CORS configuration** — `setAllowedOrigins("*")` is insecure; specify exact origins
3. **Not handling reconnection client-side** — STOMP.js v7+ handles reconnection automatically, older versions don't
4. **Using raw WebSocket instead of STOMP** — STOMP provides pub/sub, message routing, and header support
5. **Forgetting user destination prefix** — `convertAndSendToUser` requires `setUserDestinationPrefix` in config

## Official Sources

- WebSockets: `https://docs.spring.io/spring-boot/reference/messaging/websockets.html`
- Spring WebSocket: `https://docs.spring.io/spring-framework/reference/web/websocket.html`
