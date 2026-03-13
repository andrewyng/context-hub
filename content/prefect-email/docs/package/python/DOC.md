---
name: package
description: "Prefect email integration for storing SMTP credentials in a block and sending messages from flows"
metadata:
  languages: "python"
  versions: "0.4.2"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "prefect,email,python,smtp,blocks,notifications"
---

# Prefect Email Python Package Guide

## Golden Rule

Use `prefect-email` when a Prefect flow needs to send email through an SMTP account. The package gives you a Prefect block for email server credentials plus a task for sending a message.

If you only need to send email from a regular Python script and do not need Prefect blocks or flow orchestration, a plain SMTP library is usually a simpler fit.

## Install

Install the integration in every environment that will run the flow:

```bash
python -m pip install "prefect-email==0.4.2"
```

Common alternatives:

```bash
uv add prefect-email
poetry add prefect-email
```

Sanity-check the install:

```bash
python -m pip show prefect-email
```

## What You Need Before Sending Mail

`prefect-email` does not issue its own API key. Authentication comes from the SMTP account you already use with your mail provider.

Collect these values first:

- SMTP host name, such as `smtp.example.com`
- SMTP port for your provider
- SMTP username
- SMTP password or app password
- sender email address and recipient email address

Example environment variables:

```bash
export SMTP_HOST="smtp.example.com"
export SMTP_PORT="465"
export SMTP_USERNAME="noreply@example.com"
export SMTP_PASSWORD="replace-me"
export ALERT_EMAIL_TO="ops@example.com"
```

If you plan to save and later load a named Prefect block, configure Prefect itself as well:

```bash
export PREFECT_API_URL="https://api.prefect.cloud/api/accounts/<account-id>/workspaces/<workspace-id>"
export PREFECT_API_KEY="pnu_..."
```

Direct instantiation of `EmailServerCredentials(...)` does not require a Prefect API connection. Saving with `save(...)` and loading with `load(...)` does.

## Initialize Credentials In Code

There is no long-lived `prefect-email` client to initialize. The main setup object is the `EmailServerCredentials` block.

```python
import os

from prefect_email import EmailServerCredentials


email_credentials = EmailServerCredentials(
    username=os.environ["SMTP_USERNAME"],
    password=os.environ["SMTP_PASSWORD"],
    smtp_server=os.environ["SMTP_HOST"],
    smtp_type="SSL",
    smtp_port=int(os.environ.get("SMTP_PORT", "465")),
)
```

Use the SMTP security mode and port required by your provider. For example, many providers use SSL on port `465` or STARTTLS on port `587`.

## Save And Reuse A Named Block

When several flows should share the same SMTP configuration, save it once and load it by name later.

```python
import os

from prefect_email import EmailServerCredentials


email_credentials = EmailServerCredentials(
    username=os.environ["SMTP_USERNAME"],
    password=os.environ["SMTP_PASSWORD"],
    smtp_server=os.environ["SMTP_HOST"],
    smtp_type="SSL",
    smtp_port=int(os.environ.get("SMTP_PORT", "465")),
)

email_credentials.save("smtp-alerts", overwrite=True)
```

Load the block inside a flow or task:

```python
from prefect_email import EmailServerCredentials


email_credentials = EmailServerCredentials.load("smtp-alerts")
```

## Send An Email From A Flow

The practical workflow is to load a credentials block, then call `email_send_message` from inside a flow.

```python
from prefect import flow
from prefect_email import EmailServerCredentials, email_send_message


@flow(log_prints=True)
def send_failure_notice() -> None:
    email_credentials = EmailServerCredentials.load("smtp-alerts")

    email_send_message(
        email_server_credentials=email_credentials,
        subject="Prefect run needs attention",
        msg="The nightly sync flow failed. Check the Prefect UI for details.",
        email_to=["ops@example.com"],
    )


if __name__ == "__main__":
    send_failure_notice()
```

What matters here:

- `email_server_credentials` is the block instance that holds SMTP settings and authentication.
- `subject`, `msg`, and `email_to` are the core inputs for a basic message send.
- The runtime environment must have both `prefect-email` installed and network access to the SMTP server.

## Use Direct Instantiation Instead Of A Saved Block

If your runtime already gets secrets from environment variables or another secret manager, you can skip Prefect block storage and build the credentials inline.

```python
import os

from prefect import flow
from prefect_email import EmailServerCredentials, email_send_message


@flow
def send_inline_email() -> None:
    email_credentials = EmailServerCredentials(
        username=os.environ["SMTP_USERNAME"],
        password=os.environ["SMTP_PASSWORD"],
        smtp_server=os.environ["SMTP_HOST"],
        smtp_type="SSL",
        smtp_port=int(os.environ.get("SMTP_PORT", "465")),
    )

    email_send_message(
        email_server_credentials=email_credentials,
        subject="Job finished",
        msg="Your scheduled flow run completed.",
        email_to=[os.environ["ALERT_EMAIL_TO"]],
    )
```

This pattern avoids a Prefect API dependency, but you still need to provide the SMTP credentials securely at runtime.

## Common Pitfalls

- Installing `prefect-email` does not replace core `prefect`; you still use Prefect for `@flow`, tasks, deployments, workers, and block storage.
- `save(...)` and `load(...)` require a working Prefect API configuration. Inline construction does not.
- SMTP authentication details are provider-specific. The host, port, and security mode must match the mail service you actually use.
- The worker or local runtime must be able to reach the SMTP server over the network.
- Keep SMTP passwords out of source control. Use environment variables, a secret manager, or a saved Prefect block.

## Version Notes For `prefect-email` 0.4.2

- This guide covers the PyPI package version `0.4.2`.
- Pin the integration version your project expects, especially when you also pin the core `prefect` package.

## Official Sources Used

- Docs root: `https://docs.prefect.io/v3/`
- Integrations root: `https://docs.prefect.io/integrations/`
- Package integration docs: `https://docs.prefect.io/integrations/prefect-email/`
- Blocks concept docs: `https://docs.prefect.io/v3/concepts/blocks`
- Settings and profiles: `https://docs.prefect.io/v3/concepts/settings-and-profiles`
- Python reference root: `https://reference.prefect.io/prefect_email/`
- PyPI package page: `https://pypi.org/project/prefect-email/`
