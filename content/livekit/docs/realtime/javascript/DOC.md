---
name: realtime
description: "LiveKit Client SDK for JavaScript/TypeScript enabling real-time video, audio, and data communication via WebRTC."
metadata:
  languages: "javascript"
  versions: "2.19.1"
  revision: 1
  updated-on: "2026-05-29"
  source: maintainer
  tags: "livekit,realtime,webrtc,video,audio"
---

# LiveKit Client SDK Coding Guidelines (JavaScript/TypeScript)

You are a LiveKit Client SDK expert. Help me with writing code using the LiveKit Client SDK for JavaScript/TypeScript. Please follow the following guidelines when generating code. You can find the official SDK documentation and code samples here: https://docs.livekit.io

## Golden Rule: Use the Current LiveKit Client SDK

Always use the official LiveKit Client SDK for JavaScript/TypeScript, which is the standard library for all LiveKit real-time communication interactions.

- **Library Name:** LiveKit Client SDK
- **Package Name:** `livekit-client`
- **Current Version:** 2.19.1

**Installation:**
- **Correct:** `npm install livekit-client`
- **Correct:** `yarn add livekit-client`
- **Correct:** `pnpm add livekit-client`

**Import Patterns:**
- **Correct:** `import { Room, connect } from 'livekit-client'`
- **Correct:** `import { LocalParticipant, RemoteParticipant } from 'livekit-client'`
- **Correct:** `import { Track, RoomEvent } from 'livekit-client'`
- **Correct:** `import { createLocalTracks } from 'livekit-client'`

## Core Architecture

The LiveKit Client SDK is built around three main concepts: **Rooms**, **Participants**, and **Tracks** <cite />. Understanding this hierarchy is crucial for effective usage.

### Room Connection

Always start by connecting to a room using the `connect` function:

```typescript
import { connect, Room } from 'livekit-client';

const room = await connect(url, token, {
  // connection options
  autoSubscribe: true,
  publishDefaults: {
    simulcast: true,
  }
});
```

### Event-Driven Architecture

LiveKit uses an event-driven model. Always set up event listeners before connecting <cite />:

```typescript
room.on(RoomEvent.Connected, () => {
  console.log('Connected to room');
});

room.on(RoomEvent.ParticipantConnected, (participant) => {
  console.log('Participant joined:', participant.identity);
});

room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
  if (track.kind === Track.Kind.Video) {
    const videoElement = track.attach();
    document.body.appendChild(videoElement);
  }
});
```

## Media Management

### Publishing Local Media

Use the `LocalParticipant` methods for common media types:

```typescript
const localParticipant = room.localParticipant;

// Enable camera and microphone
await localParticipant.setCameraEnabled(true);
await localParticipant.setMicrophoneEnabled(true);

// Enable screen sharing
await localParticipant.setScreenShareEnabled(true);

// Disable camera (mute)
await localParticipant.setCameraEnabled(false);
```

### Publishing Custom Tracks

For custom media sources, use `publishTrack`:

```typescript
const publication = await room.localParticipant.publishTrack(mediaStreamTrack, {
  name: 'mytrack',
  simulcast: true,
  source: Track.Source.Camera, // or .Microphone, .ScreenShare
});

// Mute or unpublish later
publication.setMuted(true);
room.localParticipant.unpublishTrack(mediaStreamTrack);
```

### Subscribing to Remote Media

Access remote participants and their tracks:

```typescript
const remoteParticipant = room.remoteParticipants.get('participant-identity');
if (remoteParticipant) {
  if (remoteParticipant.isCameraEnabled) {
    const publication = remoteParticipant.getTrackPublication(Track.Source.Camera);
    if (publication?.isSubscribed) {
      const videoElement = publication.videoTrack?.attach();
      // Add to DOM
    }
  }
}
```

## Advanced Features

### Pre-creating Tracks

Create tracks before joining a room for staging areas:

```typescript
const tracks = await createLocalTracks({
  audio: true,
  video: true,
});
```

### Device Management

List and switch between devices:

```typescript
// List devices
const devices = await Room.getLocalDevices('audioinput');

// Switch to specific device
const device = devices[devices.length - 1];
await room.switchActiveDevice('audioinput', device.deviceId);

// Switch using constraints (mobile camera)
await videoTrack.restartTrack({
  facingMode: 'environment',
});
```

### Error Handling

Handle device failures properly:

```typescript
room.on(RoomEvent.MediaDevicesError, (error) => {
  const failure = MediaDeviceFailure.getFailure(error);
  switch (failure) {
    case 'PermissionDenied':
      // Handle permission denied
      break;
    case 'NotFound':
      // Handle device not found
      break;
    case 'DeviceInUse':
      // Handle device in use
      break;
  }
});

// Check last errors
console.log(room.localParticipant.lastCameraError);
console.log(room.localParticipant.lastMicrophoneError);
```

### RPC (Remote Procedure Calls)

For participant-to-participant communication:

```typescript
// Register an RPC method
room.localParticipant?.registerRpcMethod(
  'greet',
  async (data: RpcInvocationData) => {
    console.log(`Received greeting from ${data.callerIdentity}: ${data.payload}`);
    return `Hello, ${data.callerIdentity}!`;
  },
);

// Call an RPC method
try {
  const response = await room.localParticipant!.performRpc({
    destinationIdentity: 'recipient-identity',
    method: 'greet',
    payload: 'Hello from RPC!',
  });
  console.log('RPC response:', response);
} catch (error) {
  console.error('RPC call failed:', error);
}
```

## Video Quality and Simulcast

### Simulcast Configuration

The SDK automatically configures simulcast layers based on video resolution. Default presets include:

- **16:9 content:** Uses `h180` and `h360` simulcast layers
- **4:3 content:** Uses corresponding 4:3 presets
- **Screen sharing:** Uses custom calculated layers 

```typescript
// Enable simulcast (recommended)
await room.localParticipant.publishTrack(videoTrack, {
  simulcast: true,
  videoCodec: 'vp9', // or 'vp8', 'h264', 'av1'
});
```

## Connection Quality

### Monitor Connection Quality

Track participant connection quality:

```typescript
room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
  console.log(`${participant.identity} quality: ${quality}`);
  // quality can be: 'excellent', 'good', 'poor', 'lost', 'unknown'
});
```

## Browser Compatibility

The SDK supports modern browsers:

- Chrome (desktop and Android)
- Firefox (desktop and Android)  
- Safari (macOS and iOS)
- Edge (Chromium-based)

Check compatibility:

```typescript
import { isBrowserSupported, supportsAdaptiveStream, supportsDynacast } from 'livekit-client';

if (!isBrowserSupported()) {
  console.warn('Browser not supported');
}

if (supportsAdaptiveStream()) {
  // Enable adaptive streaming features
}
```

## Best Practices

1. **Always handle events:** Set up event listeners before connecting
2. **Use simulcast:** Enable simulcast for better quality adaptation
3. **Handle errors gracefully:** Implement proper error handling for device failures
4. **Clean up resources:** Disconnect from rooms and dispose of tracks when done
5. **Check browser support:** Verify compatibility before initializing
6. **Use TypeScript:** The SDK is built with TypeScript for better developer experience

## Error Codes

Common error codes you may encounter:

| Code | Name | Reason |
|------|------|--------|
| 1 | `ConnectionError` | Various connection issues |
| 10 | `UnsupportedServer` | Server version incompatible |
| 12 | `UnexpectedConnectionState` | Connection state error |
| 13 | `NegotiationError` | WebRTC negotiation failed |
| 20 | `TrackInvalidError` | Track-related error |
| 21 | `DeviceUnsupportedError` | Device not supported |
| 40 | `CryptorError` | E2EE encryption error |

## Useful Links

- Documentation: https://docs.livekit.io
- GitHub Repository: https://github.com/livekit/client-sdk-js
- Examples: https://github.com/livekit-examples
- LiveKit Cloud: https://livekit.io/cloud

## Notes

This guide covers the core functionality of the LiveKit Client SDK. The SDK also includes advanced features like End-to-End Encryption (E2EE), connection diagnostics, and sophisticated media transport optimizations that are documented in the Advanced Features section of the codebase <cite />. For React applications, consider using the LiveKit React Components library for pre-built UI components.

Wiki pages you might want to explore:
- [Overview (livekit/client-sdk-js)](/wiki/livekit/client-sdk-js#1)
- [Advanced Features (livekit/client-sdk-js)](/wiki/livekit/client-sdk-js#6)

