---
name: realtime
description: "LiveKit Python SDK for real-time video, audio, and data communication including room management and recording."
metadata:
  languages: "python"
  versions: "1.1.9,1.1.0"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "livekit,realtime,webrtc,video,audio"
---

# LiveKit Python SDK Example

This repository contains an interactive Streamlit demo application showcasing the LiveKit Python SDK capabilities for real-time video, audio, and data communication.

## Overview

The example demonstrates key LiveKit Python SDK features including:
- Access token generation
- Room management operations
- Recording (Egress) functionality
- Real-time connection handling
- Remote Procedure Calls (RPC)
- Environment configuration

## Prerequisites

- Python 3.8 or higher
- LiveKit server instance (LiveKit Cloud or self-hosted)

## Installation

1. **Install dependencies:**
   ```bash
   pip install streamlit livekit livekit-api
   ```

   Or using the provided pyproject.toml:
   ```bash
   pip install -e .
   ```

2. **Set up environment variables:**

   Copy the sample environment file and configure your LiveKit credentials:
   ```bash
   cp example/.env.sample example/.env
   ```

   Edit `example/.env` with your LiveKit server details:
   ```
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-api-secret
   ```

## Running the Demo

1. **Navigate to the example directory:**
   ```bash
   cd example
   ```

2. **Run the Streamlit application:**
   ```bash
   streamlit run app.py
   ```

3. **Open your browser:**
   The application will automatically open in your default browser at `http://localhost:8501`

## Demo Features

### Access Token Generation
Generate JWT tokens for client authentication with configurable:
- User identity and display name
- Room permissions (join, publish, subscribe)
- Token expiration settings

### Room Management
Demonstrate server API capabilities:
- Create new rooms with custom settings
- List existing rooms
- Delete rooms
- Manage room participants

### Recording (Egress)
Show recording functionality:
- Start room composite recordings
- Configure output formats
- Monitor recording status

### Real-time Connection
Interactive examples of:
- Connecting to rooms as a participant
- Handling track subscriptions
- Processing video/audio streams
- Managing connection events

### RPC Methods
Remote procedure call demonstrations:
- Register RPC method handlers
- Perform RPC calls between participants
- Handle responses and errors

## Project Structure

```
example/
├── app.py              # Main Streamlit application
├── pyproject.toml      # Project dependencies and configuration
├── .env.sample         # Environment variables template
└── .streamlit/         # Streamlit configuration
    └── config.toml
```

## SDK Documentation

For comprehensive documentation and additional examples:
- **Official Documentation**: https://docs.livekit.io/
- **Python SDK Guide**: https://docs.livekit.io/home/client/connect/
- **Server API Reference**: https://docs.livekit.io/reference/server/server-apis
- **Community Examples**: https://github.com/livekit-examples

## Environment Variables

The application requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `LIVEKIT_URL` | LiveKit server WebSocket URL | Yes |
| `LIVEKIT_API_KEY` | API authentication key | Yes |
| `LIVEKIT_API_SECRET` | API authentication secret | Yes |

## Development

### Code Style
The project uses Black and Ruff for code formatting and linting:

```bash
# Format code
black .

# Lint code
ruff check .
```

### Testing
Run tests using pytest:

```bash
pytest
```

## Support

- **Documentation**: https://docs.livekit.io/
- **Community Slack**: https://livekit.io/join-slack
- **GitHub Issues**: Report issues on the respective SDK repositories

## License

This example is provided under the same license as the LiveKit Python SDK.