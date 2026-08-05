---
name: email-api
description: "SendGrid Python SDK for sending emails and managing email communications via the SendGrid API."
metadata:
  languages: "python"
  versions: "6.12.5"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "sendgrid,email,transactional,templates,delivery"
---

# SendGrid API Coding Guidelines (Python)

You are a SendGrid API coding expert. Help me with writing code using the SendGrid Python SDK for sending emails and managing email communications.

Please follow the following guidelines when generating code.

You can find the official SDK documentation and code samples here:
https://sendgrid.com/docs/

## Golden Rule: Use the Correct and Current SDK

Always use the official SendGrid Python SDK to send emails and interact with SendGrid's Web API v3. 

- **Library Name:** SendGrid Python SDK
- **Python Package:** `sendgrid`
- **GitHub Repository:** sendgrid/sendgrid-python

**Installation:**

- **Correct:** `pip install sendgrid`

**APIs and Usage:**

- **Correct:** `from sendgrid import SendGridAPIClient`
- **Correct:** `from sendgrid.helpers.mail import Mail`
- **Correct:** `sg = SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))`

## Initialization and API Key

The SendGrid Python library requires creating a client object for all API calls. 

- Always use `SendGridAPIClient()` to create a client object.
- Set `SENDGRID_API_KEY` environment variable, which will be picked up automatically.
- API key can also be passed directly to the constructor.

## Environment Setup

### Setting API Key Environment Variable

**Mac/Linux:**
```bash
export SENDGRID_API_KEY='YOUR_API_KEY'
# Or create a .env file
echo "SENDGRID_API_KEY='YOUR_API_KEY'" > .env
```

**Windows:**
```bash
set SENDGRID_API_KEY=YOUR_API_KEY
# Or permanently:
setx SENDGRID_API_KEY "YOUR_API_KEY"
``` 

## Basic Email Sending

### Simple Email with Mail Helper Class

Here's how to send a basic email using the Mail helper class:

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Create the email message
message = Mail(
    from_email='from@example.com',
    to_emails='to@example.com',
    subject='Sending with SendGrid is Fun',
    html_content='<strong>and easy to do anywhere, even with Python</strong>'
)

# Send the email
try:
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sg.send(message)
    print(response.status_code)
    print(response.body)
    print(response.headers)
except Exception as e:
    print(e)
``` 

### Email with Both HTML and Plain Text Content

```python
from sendgrid.helpers.mail import Mail, Content
from sendgrid import SendGridAPIClient
import os

message = Mail(
    from_email='from@example.com',
    to_emails='to@example.com',
    subject='Multi-format Email'
)

# Add plain text content
message.add_content(Content("text/plain", "Hello, this is plain text!"))

# Add HTML content  
message.add_content(Content("text/html", "<strong>Hello, this is HTML!</strong>"))

sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
response = sg.send(message)
``` 

## Advanced Email Features

### Using Dynamic Templates

For emails with dynamic content using SendGrid templates:

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='from@example.com',
    to_emails='to@example.com'
)

# Set template ID and dynamic data
message.template_id = 'd-your-template-id-here'
message.dynamic_template_data = {
    'subject': 'Testing Templates',
    'name': 'John Doe',
    'city': 'San Francisco'
}

sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
response = sg.send(message)
``` 

### Multiple Recipients

```python
from sendgrid.helpers.mail import Mail, To

# Multiple recipients in to_emails list
message = Mail(
    from_email='from@example.com',
    to_emails=['user1@example.com', 'user2@example.com', 'user3@example.com'],
    subject='Email to Multiple Recipients',
    html_content='<strong>Hello everyone!</strong>'
)
``` 

### Adding Attachments

```python
from sendgrid.helpers.mail import Mail, Attachment
import base64

message = Mail(
    from_email='from@example.com',
    to_emails='to@example.com',
    subject='Email with Attachment',
    html_content='<strong>Please see attached file</strong>'
)

# Add attachment
with open('path/to/file.pdf', 'rb') as f:
    data = f.read()
    f.close()

encoded_file = base64.b64encode(data).decode()
attachment = Attachment(
    file_content=encoded_file,
    file_name='attachment.pdf',
    file_type='application/pdf',
    disposition='attachment'
)

message.add_attachment(attachment)
``` 

### Personalizations for Individual Recipients

```python
from sendgrid.helpers.mail import Mail, Personalization, To, Subject

message = Mail()
message.from_email = 'from@example.com'

# Create separate personalization for each recipient
personalization1 = Personalization()
personalization1.add_to(To('user1@example.com', 'User One'))
personalization1.subject = 'Personal message for User One'

personalization2 = Personalization() 
personalization2.add_to(To('user2@example.com', 'User Two'))
personalization2.subject = 'Personal message for User Two'

message.add_personalization(personalization1)
message.add_personalization(personalization2)
``` 

## API Client Usage

### General Web API Usage (Fluent Interface)

For accessing other SendGrid APIs beyond mail sending:

```python
import os
from sendgrid import SendGridAPIClient

sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

# Get bounce suppressions
response = sg.client.suppression.bounces.get()
print(response.status_code)
print(response.body)

# Get API keys
response = sg.client.api_keys.get()
print(response.status_code)
``` 

### Alternative API Usage (Non-Fluent Interface)

```python
import os
from sendgrid import SendGridAPIClient

sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))

# Using string path instead of fluent interface
response = sg.client._("suppression/bounces").get()
print(response.status_code)
``` 

## Configuration Options

### Data Residency

For EU data residency compliance:

```python
from sendgrid import SendGridAPIClient

sg = SendGridAPIClient(api_key='your-api-key')
sg.set_sendgrid_data_residency('eu')  # 'eu' or 'global'
``` 

### Subuser Impersonation

To send emails on behalf of a subuser:

```python
from sendgrid import SendGridAPIClient

sg = SendGridAPIClient(
    api_key='your-api-key',
    impersonate_subuser='subuser@example.com'
)
``` 

## Error Handling

Always wrap SendGrid API calls in try-catch blocks:

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='from@example.com',
    to_emails='to@example.com',
    subject='Test Email',
    html_content='<strong>Test</strong>'
)

try:
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sg.send(message)
    
    # Check response status
    if response.status_code >= 200 and response.status_code < 300:
        print("Email sent successfully!")
    else:
        print(f"Failed to send email. Status: {response.status_code}")
        print(f"Response: {response.body}")
        
except Exception as e:
    print(f"Error occurred: {e}")
``` 

## Best Practices

### Mail Helper Class vs Raw JSON

- **Recommended:** Use the Mail helper class for building emails as it provides validation and easier syntax
- **Alternative:** Raw JSON can be used but requires manual construction of the payload 

### Content Ordering

When adding multiple content types, follow this order:
1. Plain text (`text/plain`)
2. AMP HTML (`text/x-amp-html`) 
3. HTML (`text/html`) 

### Environment Variables

- Always use environment variables for API keys, never hardcode them
- Use `.env` files for local development and add them to `.gitignore` 

## Common Mail Helper Classes

Key classes from `sendgrid.helpers.mail`:

- `Mail` - Main email builder class
- `From` - Sender email address
- `To`, `Cc`, `Bcc` - Recipient email addresses  
- `Content` - Email content (HTML/plain text)
- `Attachment` - File attachments
- `Personalization` - Individual recipient customization
- `TemplateId` - Dynamic template reference 

## Useful Links

- **Documentation:** https://sendgrid.com/docs/
- **API Reference:** https://sendgrid.com/docs/API_Reference/index.html
- **Library Documentation:** https://github.com/sendgrid/sendgrid-python
- **Use Cases:** https://github.com/sendgrid/sendgrid-python/tree/main/use_cases
- **Troubleshooting:** https://github.com/sendgrid/sendgrid-python/blob/main/TROUBLESHOOTING.md

## Notes

This SendGrid Python SDK provides full support for SendGrid Web API v3 endpoints. The library uses the Mail helper class as the primary interface for building and sending emails, with the SendGridAPIClient handling the actual API communication. Always ensure proper error handling and use environment variables for sensitive data like API keys.

## Official Documentation

**This library allows you to quickly and easily use the SendGrid Web API v3 via Python.**

Version 3.X.X+ of this library provides full support for all SendGrid [Web API v3](https://sendgrid.com/docs/API_Reference/Web_API_v3/index.html) endpoints, including the new [v3 /mail/send](https://sendgrid.com/blog/introducing-v3mailsend-sendgrids-new-mail-endpoint).

### Alternative Environment Setup Methods

#### Mac

Update the development environment with your [SENDGRID_API_KEY](https://app.sendgrid.com/settings/api_keys) (more info [here](https://sendgrid.com/docs/User_Guide/Settings/api_keys.html)), for example:

```bash
echo "export SENDGRID_API_KEY='YOUR_API_KEY'" > sendgrid.env
echo "sendgrid.env" >> .gitignore
source ./sendgrid.env
```
SendGrid also supports local environment file `.env`. Copy or rename `.env_sample` into `.env` and update [SENDGRID_API_KEY](https://app.sendgrid.com/settings/api_keys) with your key.

#### Windows
Temporarily set the environment variable(accessible only during the current cli session):
```bash
set SENDGRID_API_KEY=YOUR_API_KEY
```
Permanently set the environment variable(accessible in all subsequent cli sessions):
```bash
setx SENDGRID_API_KEY "YOUR_API_KEY"
```
## Code Examples

### With Mail Helper Class

```python
import sendgrid
import os
from sendgrid.helpers.mail import *

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
from_email = Email("test@example.com")
to_email = To("test@example.com")
subject = "Sending with SendGrid is Fun"
content = Content("text/plain", "and easy to do anywhere, even with Python")
mail = Mail(from_email, to_email, subject, content)
response = sg.client.mail.send.post(request_body=mail.get())
print(response.status_code)
print(response.body)
print(response.headers)
```

### Fluent API Usage

```python
import sendgrid
import os

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
response = sg.client.suppression.bounces.get()
print(response.status_code)
print(response.body)
print(response.headers)
```

### Non-Fluent API Usage

```python
import sendgrid
import os

sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
response = sg.client._("suppression/bounces").get()
print(response.status_code)
print(response.body)
print(response.headers)
```
## SendGridAPIClient Constructor

```python
def __init__(
        self,
        api_key=None,
        host='https://api.sendgrid.com',
        impersonate_subuser=None):
    """
    Construct the Twilio SendGrid v3 API object.
    Note that the underlying client is being set up during initialization,
    therefore changing attributes in runtime will not affect HTTP client
    behaviour.

    :param api_key: Twilio SendGrid API key to use. If not provided, value
                    will be read from environment variable "SENDGRID_API_KEY"
    :type api_key: string
    :param impersonate_subuser: the subuser to impersonate. Will be passed
                                by "On-Behalf-Of" header by underlying
                                client. See
                                https://sendgrid.com/docs/User_Guide/Settings/subusers.html
                                for more details
    :type impersonate_subuser: string
    :param host: base URL for API calls
    :type host: string
    """
    self.api_key = api_key or os.environ.get('SENDGRID_API_KEY')
    auth = 'Bearer {}'.format(self.api_key)

    super(SendGridAPIClient, self).__init__(auth, host, impersonate_subuser)
```

## Helper Class Imports

```python
from .bcc_email import Bcc
from .cc_email import Cc
from .content import Content
from .custom_arg import CustomArg
from .dynamic_template_data import DynamicTemplateData
from .email import Email
from .from_email import From
from .header import Header
from .mime_type import MimeType
from .personalization import Personalization
from .reply_to import ReplyTo
from .send_at import SendAt
from .subject import Subject
from .substitution import Substitution
from .template_id import TemplateId
from .to_email import To
```

## Mail Methods

### Add Personalization

```python
def add_personalization(self, personalization, index=0):
    """Add a Personalization object

    :param personalization: Add a Personalization object
    :type personalization: Personalization
    :param index: The index where to add the Personalization
    :type index: int
    """
    self._personalizations = self._ensure_append(
        personalization, self._personalizations, index)
```

### Add To Recipients

```python
def add_to(
        self, to_email, global_substitutions=None, is_multiple=False, p=0):
    """Adds a To object to the Personalization object

    :param to_email: A To object
    :type to_email: To, str, tuple, list(str), list(tuple), list(To)
    :param global_substitutions: A dict of substitutions for all recipients
    :type global_substitutions: dict
    :param is_multiple: Create a new personalization for each recipient
    :type is_multiple: bool
    :param p: p is the Personalization object or Personalization object
              index
    :type p: Personalization, integer, optional
    """

    if isinstance(to_email, list):
        for email in to_email:
            if isinstance(email, str):
                email = To(email, None)
            elif isinstance(email, tuple):
                email = To(email[0], email[1])
            elif not isinstance(email, Email):
                raise ValueError(
                    'Please use a To/Cc/Bcc, tuple, or a str for a to_email list.'
                )
            self._set_emails(email, global_substitutions, is_multiple, p)
    else:
        if isinstance(to_email, str):
            to_email = To(to_email, None)
        if isinstance(to_email, tuple):
            to_email = To(to_email[0], to_email[1])
        if isinstance(to_email, Email):
            p = to_email.personalization
        self._set_emails(to_email, global_substitutions, is_multiple, p)
```

### Add Content

```python
def add_content(self, content, mime_type=None):
    """Add content to the email

    :param contents: Content to be added to the email
    :type contents: Content
    :param mime_type: Override the mime type
    :type mime_type: MimeType, str
    """
    if isinstance(content, str):
        content = Content(mime_type, content)
    # Content of mime type text/plain must always come first, followed by text/x-amp-html and then text/html
    if content.mime_type == MimeType.text:
        self._contents = self._ensure_insert(content, self._contents)
    elif content.mime_type == MimeType.amp:
        if self._contents:
            for _content in self._contents:
                # this is written in the context that plain text content will always come earlier than the html content
                if _content.mime_type == MimeType.text:
                    index = 1
                    break
                elif _content.mime_type == MimeType.html:
                    index = 0
                    break
        else:
            index = 0
        self._contents = self._ensure_append(
            content, self._contents, index=index)
    else:
        if self._contents:
            index = len(self._contents)
        else:
            index = 0
        self._contents = self._ensure_append(
            content, self._contents, index=index)
```

### Add Attachment

```python
def add_attachment(self, attachment):
    """Add an attachment to this email

    :param attachment: Add an attachment to this email
    :type attachment: Attachment
    """
    self._attachments = self._ensure_append(attachment, self._attachments)
```

## Template Usage Example

```python
message = Mail(
    from_email='from_email@example.com',
    to_emails='to@example.com',
    html_content='<strong>and easy to do anywhere, even with Python</strong>')
message.dynamic_template_data = {
    'subject': 'Testing Templates',
    'name': 'Some One',
    'city': 'Denver'
}
message.template_id = 'd-f43daeeaef504760851f727007e0b5d0'
try:
    sendgrid_client = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sendgrid_client.send(message)
    print(response.status_code)
    print(response.body)
    print(response.headers)
except Exception as e:
    print(e.message)
```

## SendGridAPIClient Methods

### Send Method

```python
def send(self, message):
    """Make a Twilio SendGrid v3 API request with the request body generated by
       the Mail object

    :param message: The Twilio SendGrid v3 API request body generated by the Mail
                    object
    :type message: Mail
    """
    if not isinstance(message, dict):
        message = message.get()

    return self.client.mail.send.post(request_body=message)
```

### Data Residency Method

```python
def set_sendgrid_data_residency(self, region):
    """
    Client libraries contain setters for specifying region/edge.
    This supports global and eu regions only. This set will likely expand in the future.
    Global is the default residency (or region)
    Global region means the message will be sent through https://api.sendgrid.com
    EU region means the message will be sent through https://api.eu.sendgrid.com
    :param region: string
    :return:
    """
    if region in region_host_dict.keys():
        self.host = region_host_dict[region]
        if self._default_headers is not None:
            self.client = python_http_client.Client(
                host=self.host,
                request_headers=self._default_headers,
                version=3)
    else:
        raise ValueError("region can only be \"eu\" or \"global\"")
```

## Final Error Handling Example

```python
try:
    sendgrid_client = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sendgrid_client.send(message)
    print(response.status_code)
    print(response.body)
    print(response.headers)
except Exception as e:
    print(e)
```
