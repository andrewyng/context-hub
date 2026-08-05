---
name: spring-boot-mail
description: "Spring Boot 4.0.x email sending — JavaMailSender, simple and HTML emails, attachments, Thymeleaf templates, and async email delivery"
metadata:
  languages: "java"
  versions: "4.0.5"
  revision: 1
  updated-on: "2026-03-28"
  source: community
  tags: "spring-boot-mail,email,smtp,javamail,thymeleaf,attachments"
---

# Spring Boot Mail for 4.0.x

## What This Covers

Email sending with Spring Boot 4.0.x — SMTP configuration, simple and HTML emails, file attachments, Thymeleaf-based email templates, and async delivery patterns.

- Starter: `spring-boot-starter-mail`
- Docs: `https://docs.spring.io/spring-boot/reference/io/email.html`

## Install

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
<!-- For HTML email templates -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

## Configuration

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enabled: true
            required: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
    default-encoding: UTF-8
```

### Common SMTP providers

- **Gmail**: `smtp.gmail.com:587` (TLS) — requires App Password with 2FA
- **AWS SES**: `email-smtp.{region}.amazonaws.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Resend**: `smtp.resend.com:465` (SSL)
- **Mailgun**: `smtp.mailgun.org:587`

## Simple Text Email

```java
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        var message = new SimpleMailMessage();
        message.setFrom("noreply@myapp.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
```

## HTML Email

```java
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom("noreply@myapp.com");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);  // true = isHtml
        mailSender.send(message);
    }
}
```

## Email with Attachment

```java
public void sendWithAttachment(String to, String subject, String text,
                                String attachmentName, byte[] attachmentData)
        throws MessagingException {
    MimeMessage message = mailSender.createMimeMessage();
    var helper = new MimeMessageHelper(message, true);
    helper.setFrom("noreply@myapp.com");
    helper.setTo(to);
    helper.setSubject(subject);
    helper.setText(text);
    helper.addAttachment(attachmentName,
        new ByteArrayResource(attachmentData));
    mailSender.send(message);
}
```

## Thymeleaf Email Templates

Create `src/main/resources/templates/email/welcome.html`:

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<body>
    <h1>Welcome, <span th:text="${userName}">User</span>!</h1>
    <p>Thank you for signing up. Click below to verify your email:</p>
    <a th:href="${verificationUrl}">Verify Email</a>
</body>
</html>
```

Service:

```java
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public EmailService(JavaMailSender mailSender, TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void sendWelcomeEmail(String to, String userName, String verificationUrl)
            throws MessagingException {
        var context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("verificationUrl", verificationUrl);

        String htmlContent = templateEngine.process("email/welcome", context);

        MimeMessage message = mailSender.createMimeMessage();
        var helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom("noreply@myapp.com");
        helper.setTo(to);
        helper.setSubject("Welcome to MyApp!");
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
```

## Async Email Sending

Combine with `@Async` to avoid blocking the request thread:

```java
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailService {

    @Async
    public void sendWelcomeEmailAsync(String to, String userName, String url) {
        try {
            sendWelcomeEmail(to, userName, url);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}: {}", to, e.getMessage());
        }
    }
}
```

Requires `@EnableAsync` on a configuration class.

## Common Mistakes

1. **Sending email synchronously in controllers** — blocks the HTTP response; use `@Async`
2. **Hardcoding SMTP credentials** — use environment variables: `${MAIL_USERNAME}`
3. **Gmail without App Password** — regular passwords don't work with 2FA enabled
4. **Not setting timeouts** — SMTP connections can hang; always set connection/read/write timeouts
5. **Using `javax.mail`** — use `jakarta.mail` in Boot 4.0
6. **Forgetting `MimeMessageHelper(message, true)`** — the `true` enables multipart (required for attachments and HTML)

## Official Sources

- Email: `https://docs.spring.io/spring-boot/reference/io/email.html`
