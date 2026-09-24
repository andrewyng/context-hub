---
name: aws-cli-v2-sso
description: How to configure and use AWS CLI v2 with IAM Identity Center (SSO)
metadata:
  languages: "bash"
  versions: "2.34.24"
  source: community
  tags: "aws,cli,sso,auth"
  updated-on: "2026-09-24"
---

# AWS CLI v2: IAM Identity Center (SSO) Sign-In

This guide covers how to set up and use AWS IAM Identity Center (formerly SSO) with the AWS Command Line Interface (CLI) version 2.

## 1. Verify AWS CLI Version

Ensure you are using AWS CLI v2, which has built-in support for SSO.

```bash
aws --version
# Expected output similar to: aws-cli/2.34.24 Python/3.13.13 ...
```

## 2. Initial Configuration (`aws configure sso`)

Use the interactive wizard to configure an SSO profile. This process creates a session and links it to an AWS profile.

```bash
aws configure sso
```

You will be prompted to provide:
- **SSO session name (Recommended)**: A name for the SSO session (e.g., `my-sso-session`).
- **SSO start URL**: The URL for your IAM Identity Center portal (e.g., `https://my-company.awsapps.com/start`).
- **SSO region**: The AWS Region where SSO is hosted (e.g., `us-east-1`).
- **SSO registration scopes**: Leave blank for the default (`sso:account:access`).

After entering these details, your default browser opens to authorize the request. Once authorized, the CLI prompts you to select:
- An AWS Account.
- An IAM Role available to you.
- Default CLI region, output format, and a name for the profile (e.g., `dev-profile`).

## 3. Logging In (`aws sso login`)

Once configured, use the `aws sso login` command to retrieve and cache temporary AWS credentials.

```bash
# Login using the default profile
aws sso login

# Login using a specific profile
aws sso login --profile dev-profile

# Login specifying the SSO session directly
aws sso login --sso-session my-sso-session
```

This will automatically open your browser to authenticate.

### Headless Login (`--no-browser`)

If you are on a remote server or terminal without a browser, use the `--no-browser` flag. It provides a link and a device code to enter on another device.

```bash
aws sso login --profile dev-profile --no-browser
```

## 4. Using the Configured Profile

To run AWS CLI commands using your SSO credentials, specify the profile using the `--profile` flag or by setting the `AWS_PROFILE` environment variable.

```bash
# Using the flag
aws s3 ls --profile dev-profile

# Using environment variables
export AWS_PROFILE=dev-profile
aws s3 ls
```

## 5. Verifying Your Identity

You can verify that you are successfully authenticated and assuming the correct SSO role by checking the caller identity.

```bash
aws sts get-caller-identity --profile dev-profile
```

**Expected Output:**
```json
{
    "UserId": "AROA123456789EXAMPLE:my-user-name",
    "Account": "111122223333",
    "Arn": "arn:aws:sts::111122223333:assumed-role/AWSReservedSSO_AdministratorAccess_12345678/my-user-name"
}
```

## 6. Token Cache and Expiry

SSO access tokens are cached locally in `~/.aws/sso/cache/`. These tokens expire according to the session duration set in IAM Identity Center (typically between 1 and 12 hours).

When the token expires, CLI commands will fail, and you must run `aws sso login` again to refresh it.

## 7. Logging Out (`aws sso logout`)

To clear your cached SSO access tokens, use the `aws sso logout` command.

```bash
# Logout for a specific profile
aws sso logout --profile dev-profile

# Logout of a specific SSO session
aws sso logout --sso-session my-sso-session
```

## 8. Common Errors

### Expired Token
**Error:** `The SSO session associated with this profile has expired or is otherwise invalid.`
**Fix:** Run `aws sso login --profile <your-profile>`.

### Missing Profile
**Error:** `The config profile (<profile>) could not be found`
**Fix:** Verify the profile name in `~/.aws/config` or re-run `aws configure sso`.

### Wrong Region
**Error:** `Invalid grant provided` or SSO portal login fails.
**Fix:** Verify that the `sso_region` in your `~/.aws/config` matches the region where IAM Identity Center is configured, not necessarily your default CLI region.
