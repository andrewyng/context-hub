# Signal Detection

Detecting the active input signal on a DeckLink device is one of the
least-documented aspects of the SDK. There is no "tell me what signal is
connected" API call. You must probe by trying modes.

## The Problem

`EnableVideoInput` succeeds when the hardware can configure itself for the
requested mode, but frames only arrive when the physical signal matches. There
is no "detect" mode that auto-selects — you must cycle through candidate modes
and check for frame arrival.

`IDeckLinkStatus` (via `GetInt(bmdDeckLinkStatusDetectedVideoInputMode)`) only
reports the detected mode AFTER streams have been started and frames have
arrived. You cannot query it cold.

## Mode Cycling Probe

The proven pattern: for each candidate mode, enable it, start streams briefly,
check if frames arrived, then stop and try the next mode:

```cpp
class SignalProbeCallback : public IDeckLinkInputCallback {
    std::atomic<int32_t> ref_count_{1};
public:
    std::atomic<bool> frames_arrived{false};

    HRESULT QueryInterface(REFIID, void**) override { return E_NOINTERFACE; }
    ULONG AddRef() override { return ++ref_count_; }
    ULONG Release() override {
        int32_t c = --ref_count_;
        if (c == 0) delete this;
        return c;
    }
    HRESULT VideoInputFormatChanged(BMDVideoInputFormatChangedEvents,
        IDeckLinkDisplayMode*, BMDDetectedVideoInputFormatFlags) override {
        return S_OK;
    }
    HRESULT VideoInputFrameArrived(IDeckLinkVideoInputFrame* frame,
                                    IDeckLinkAudioInputPacket*) override {
        if (frame) frames_arrived.store(true);
        return S_OK;
    }
};

BMDDisplayMode detectSignal(IDeckLinkInput* input) {
    auto* probe = new SignalProbeCallback();
    input->SetCallback(probe);

    BMDDisplayMode probe_modes[] = {
        bmdModeHD1080p30, bmdModeHD1080p2997, bmdModeHD1080p25,
        bmdModeHD1080p24, bmdModeHD1080p2398,
        bmdModeHD1080p50, bmdModeHD1080p5994, bmdModeHD1080p6000,
        bmdModeHD1080i5994, bmdModeHD1080i50, bmdModeHD1080i6000,
        bmdModeHD720p50, bmdModeHD720p5994, bmdModeHD720p60,
        bmdModeNTSC, bmdModePAL
    };

    BMDDisplayMode detected = 0;

    for (auto mode : probe_modes) {
        if (input->EnableVideoInput(mode, bmdFormat8BitYUV,
                                    bmdVideoInputFlagDefault) != S_OK) {
            continue;  // Hardware doesn't support this mode
        }

        probe->frames_arrived.store(false);

        if (input->StartStreams() != S_OK) {
            input->DisableVideoInput();
            continue;
        }

        // Poll for up to 200ms — MUST pump NSRunLoop
        bool got_frames = false;
        for (int poll = 0; poll < 4; poll++) {
            @autoreleasepool {
                NSDate* until = [NSDate dateWithTimeIntervalSinceNow:0.05];
                [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode
                                         beforeDate:until];
            }
            if (probe->frames_arrived.load()) {
                got_frames = true;
                break;
            }
        }

        input->StopStreams();
        input->DisableVideoInput();

        if (got_frames) {
            detected = mode;
            break;
        }
    }

    input->SetCallback(nullptr);
    probe->Release();
    return detected;
}
```

## NSRunLoop Pumping — Why It Matters

The DeckLink SDK on macOS dispatches frame callbacks through the main run loop.
If you use `std::this_thread::sleep_for` instead of `NSRunLoop runMode:`, the
callbacks never fire because the run loop is blocked:

```cpp
// WRONG — callbacks never arrive
input->StartStreams();
std::this_thread::sleep_for(std::chrono::milliseconds(200));
// probe->frames_arrived is still false!

// CORRECT — pumps the run loop, callbacks fire
input->StartStreams();
for (int i = 0; i < 4; i++) {
    @autoreleasepool {
        [[NSRunLoop currentRunLoop]
            runMode:NSDefaultRunLoopMode
            beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
    }
    if (probe->frames_arrived.load()) break;
}
```

Each 50ms pump gives the SDK time to deliver a frame. At 30fps, frames arrive
every ~33ms, so 200ms (4 x 50ms) provides ample time for at least one frame.

## VideoInputFormatChanged

If you enable format detection (`bmdVideoInputEnableFormatDetection` flag), the
SDK calls `VideoInputFormatChanged` when it detects a different input format
than what was enabled. The callback provides the actual `IDeckLinkDisplayMode`:

```cpp
HRESULT VideoInputFormatChanged(
    BMDVideoInputFormatChangedEvents events,
    IDeckLinkDisplayMode* newMode,
    BMDDetectedVideoInputFormatFlags flags) override {
    if (newMode) {
        BMDDisplayMode mode = newMode->GetDisplayMode();
        // Can re-enable with the detected mode
    }
    return S_OK;
}
```

**Caveat**: Format detection requires streams to already be running. It cannot
be used for cold-start detection. The mode cycling probe above is the reliable
approach for initial discovery.

## Timing Considerations

- **200ms per mode** is a reliable timeout — allows 6+ frame intervals at 30fps
- **16 modes** means a full scan takes ~3.2 seconds worst case (no signal)
- **Order modes by likelihood** — 1080p30/29.97 first, then 1080p25/24, then
  interlaced, then SD. Most modern setups are progressive HD.
- Use `bmdVideoInputFlagDefault` (not format detection) for the probe — format
  detection changes the mode asynchronously which complicates the probe logic
