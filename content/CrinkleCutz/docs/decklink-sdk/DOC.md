---
name: decklink-sdk
description: >
  Blackmagic DeckLink SDK integration guide for macOS video capture.
  Covers device discovery, frame callbacks, UYVY buffer access, COM lifecycle,
  signal detection, and Objective-C++ bridging patterns. Derived from 5 versions
  of production capture software (V4-V8, 3 code reviews, ~200K LOC).
metadata:
  languages: "cpp"
  versions: "15.3.0"
  updated-on: "2026-03-06"
  source: "community"
  tags: "blackmagic,decklink,video,capture,sdi,hdmi,broadcast,uyvy"
---

# Blackmagic DeckLink SDK — macOS Video Capture Guide

## 1. What This Covers

This guide covers the **DeckLink SDK 15.3** on **macOS** using **C++17** (with
Objective-C++ where macOS APIs require it). The focus is the **video capture
path** — discovering devices, enabling input, receiving frames via callback, and
accessing pixel data.

The SDK ships as a macOS framework (`DeckLinkAPI.framework`) plus C++ headers.
On macOS, the SDK uses a COM-like reference counting model (AddRef/Release) but
does NOT use Microsoft COM — there is no CoInitialize, no registry, no
apartments. The iterator and interface pattern is COM-inspired but runs as plain
C++ with `QueryInterface` for interface discovery.

**SDK location**: After installing Desktop Video, the framework lives at
`/Library/Frameworks/DeckLinkAPI.framework`. The SDK download provides headers
and the critical `DeckLinkAPIDispatch.cpp` file separately.

## 2. Device Discovery

Every DeckLink session starts with `CreateDeckLinkIteratorInstance()`. This is
the only global factory function — everything else comes from `QueryInterface`.

```cpp
#include "DeckLinkAPI.h"

IDeckLinkIterator* iterator = CreateDeckLinkIteratorInstance();
if (!iterator) {
    // DeckLink drivers not installed or framework not linked
    fprintf(stderr, "DeckLink drivers not installed\n");
    return false;
}

IDeckLink* device = nullptr;
int index = 0;
while (iterator->Next(&device) == S_OK) {
    // Get device name (macOS returns CFStringRef)
    CFStringRef name_cf = nullptr;
    if (device->GetDisplayName(&name_cf) == S_OK && name_cf) {
        char name_buf[256];
        CFStringGetCString(name_cf, name_buf, sizeof(name_buf),
                           kCFStringEncodingUTF8);
        printf("Device %d: %s\n", index, name_buf);
        CFRelease(name_cf);
    }

    device->Release();
    index++;
}
iterator->Release();
```

- Returns `nullptr` if Desktop Video drivers are not installed
- Each `IDeckLink` = one sub-device (a physical card may expose multiple)
- On macOS, `GetDisplayName` returns `CFStringRef` — must `CFRelease`
- Always `Release()` every COM object when done

### Filtering Output-Only Sub-Devices

Many cards expose output-only sub-devices. Filter with `BMDDeckLinkVideoIOSupport`:

```cpp
IDeckLinkProfileAttributes* attributes = nullptr;
if (device->QueryInterface(IID_IDeckLinkProfileAttributes,
                           (void**)&attributes) == S_OK && attributes) {
    int64_t io_support = 0;
    if (attributes->GetInt(BMDDeckLinkVideoIOSupport, &io_support) == S_OK) {
        bool supports_capture = (io_support & bmdDeviceSupportsCapture) != 0;
        if (!supports_capture) {
            printf("Skipping output-only device: %s\n", name_buf);
            attributes->Release();
            device->Release();
            continue;
        }
    }

    // Also useful: query bus type
    int64_t bus_type = 0;
    if (attributes->GetInt(BMDDeckLinkDeviceInterface, &bus_type) == S_OK) {
        // bmdDeviceInterfaceThunderbolt, bmdDeviceInterfaceUSB,
        // bmdDeviceInterfacePCI
    }

    attributes->Release();
}
```

## 3. Enabling Video Input

Get `IDeckLinkInput` via QueryInterface, then enable a specific video mode:

```cpp
IDeckLinkInput* input = nullptr;
device->QueryInterface(IID_IDeckLinkInput, (void**)&input);

input->EnableVideoInput(bmdModeHD1080p30, bmdFormat8BitYUV,
                        bmdVideoInputFlagDefault);
```

### Auto-Detection Pattern

There is no "give me whatever signal is present" call. `EnableVideoInput`
succeeds only when the hardware can lock to the specified mode AND a compatible
signal is present. Cycle through common modes until one succeeds:

```cpp
BMDDisplayMode modes_to_try[] = {
    bmdModeHD1080p30, bmdModeHD1080p2997, bmdModeHD1080p25,
    bmdModeHD1080p24, bmdModeHD1080p2398, bmdModeHD1080i5994,
    bmdModeHD1080i50, bmdModeHD720p5994, bmdModeHD720p50,
    bmdModeNTSC, bmdModePAL
};

for (auto mode : modes_to_try) {
    if (input->EnableVideoInput(mode, bmdFormat8BitYUV,
                                bmdVideoInputFlagDefault) == S_OK) {
        printf("Detected: %s\n", modeToString(mode));
        return true;
    }
}
// No signal detected on any mode
```

**Warning**: Do NOT use `bmdVideoInputEnableFormatDetection` for initial mode
discovery — it requires streams to already be running and changes the mode
asynchronously via `VideoInputFormatChanged`. The cycling approach above is
synchronous and reliable for startup.

## 4. Frame Callback

Implement `IDeckLinkInputCallback` to receive frames. You must implement three
interfaces: `QueryInterface` (return `E_NOINTERFACE`), `AddRef`/`Release`
(atomic ref counting), `VideoInputFormatChanged` (can return `S_OK`), and
`VideoInputFrameArrived` (your frame processing logic). See the complete
example in section 11 for the full class.

### Buffer Access (SDK 15.3+)

SDK 15.3 changed frame pixel data access. The correct pattern uses
`IDeckLinkVideoBuffer` (not direct `GetBytes()` on the frame):

```cpp
HRESULT VideoInputFrameArrived(
    IDeckLinkVideoInputFrame* videoFrame,
    IDeckLinkAudioInputPacket* /*audioPacket*/) {

    if (!videoFrame) return S_OK;

    // Query for IDeckLinkVideoBuffer (SDK 15.3+ pattern)
    void* bytes = nullptr;
    IDeckLinkVideoBuffer* videoBuffer = nullptr;
    HRESULT hr = videoFrame->QueryInterface(IID_IDeckLinkVideoBuffer,
                                            (void**)&videoBuffer);
    if (hr != S_OK || !videoBuffer) {
        fprintf(stderr, "QueryInterface for IDeckLinkVideoBuffer failed\n");
        return S_OK;
    }

    // Must call StartAccess before GetBytes
    hr = videoBuffer->StartAccess(bmdBufferAccessRead);
    if (hr != S_OK) {
        videoBuffer->Release();
        return S_OK;
    }

    hr = videoBuffer->GetBytes(&bytes);
    if (hr != S_OK || !bytes) {
        videoBuffer->EndAccess(bmdBufferAccessRead);
        videoBuffer->Release();
        return S_OK;
    }

    // Now safe to read pixel data
    int width = videoFrame->GetWidth();
    int height = videoFrame->GetHeight();
    int rowBytes = videoFrame->GetRowBytes();
    const uint8_t* pixels = static_cast<const uint8_t*>(bytes);

    // Process the frame...
    processFrame(pixels, width, height, rowBytes);

    // MUST end access and release in this order
    videoBuffer->EndAccess(bmdBufferAccessRead);
    videoBuffer->Release();
    return S_OK;
}
```

**Critical**: Always call `EndAccess` before `Release`. Always check every
HRESULT. The buffer pointer is only valid between `StartAccess` and `EndAccess`.

## 5. COM Reference Counting

Every SDK object starts with ref count 1. `QueryInterface` increments it.
`Release` decrements — at 0, the object deletes itself. Use `std::atomic<int32_t>`
for your own callback ref counts (see section 11 example).

### Cleanup Order — Critical

Release in this exact order or you get crashes/hangs:

1. `StopStreams()` — stop capture pipeline
2. `DisableVideoInput()` — release hardware mode lock
3. **`SetCallback(nullptr)`** — disconnect callback BEFORE releasing
4. `input->Release()` — release IDeckLinkInput
5. `device->Release()` — release IDeckLink

Skipping step 3 causes use-after-free — the SDK may fire callbacks during
`Release()`.

## 6. Starting and Stopping Streams

```cpp
input->SetCallback(callback);
input->StartStreams();    // Frames now arrive via callback
// ...
input->StopStreams();     // Teardown per section 5
input->DisableVideoInput();
input->SetCallback(nullptr);
```

**Pause/Resume**: Call `StopStreams()`/`StartStreams()` without re-enabling video
input — the mode lock persists.

## 7. Display Mode Enumeration

Discover supported modes for UI dropdowns or capability reporting:

```cpp
IDeckLinkDisplayModeIterator* mode_iter = nullptr;
if (input->GetDisplayModeIterator(&mode_iter) == S_OK && mode_iter) {
    IDeckLinkDisplayMode* mode = nullptr;
    while (mode_iter->Next(&mode) == S_OK) {
        long w = mode->GetWidth();
        long h = mode->GetHeight();
        bool progressive = (mode->GetFieldDominance() == bmdProgressiveFrame);

        BMDTimeValue duration = 0;
        BMDTimeScale scale = 0;
        mode->GetFrameRate(&duration, &scale);
        double fps = (duration > 0)
            ? static_cast<double>(scale) / duration : 0.0;

        printf("%ldx%ld%s%.1f\n", w, h, progressive ? "p" : "i", fps);
        mode->Release();
    }
    mode_iter->Release();
}
```

## 8. UYVY Pixel Format Basics

The standard DeckLink capture format is `bmdFormat8BitYUV` (UYVY 4:2:2). Memory
layout for each pixel pair (4 bytes):

```
Byte 0: U  (Cb, shared by pixel 0 and pixel 1)
Byte 1: Y0 (luma of pixel 0)
Byte 2: V  (Cr, shared by pixel 0 and pixel 1)
Byte 3: Y1 (luma of pixel 1)
```

- **2 bytes per pixel** (but pixels are always processed in pairs)
- **Row stride** (`GetRowBytes()`) may include padding — always use it, never
  assume `width * 2`
- **Luma range**: Y is 16–235 (limited range) for broadcast; 0–255 if full range
- **Chroma range**: U/V centered at 128

To extract the luma (brightness) of a single pixel at position `(x, y)`:

```cpp
const uint8_t* row = buffer + y * rowBytes;
int byte_idx = x * 2;  // 2 bytes per pixel in UYVY
uint8_t luma = row[byte_idx + 1];  // Y is at odd byte positions
// For even x: Y0 is at byte_idx+1
// For odd x:  Y1 is at byte_idx+1 (which is byte_idx-1+3 of the pair)
```

For color math (UYVY to RGB conversion, ROI luma extraction), see the
[UYVY Color Math](references/uyvy-color-math.md) reference.

## 9. Common Pitfalls

- **SetCallback(nullptr) before Release** — The SDK may fire callbacks during
  `Release()`. Always `SetCallback(nullptr)` first (see section 5).

- **NSRunLoop pumping vs sleep()** — `std::this_thread::sleep_for()` blocks the
  run loop, preventing SDK callbacks from firing. Use NSRunLoop pumping:
  ```cpp
  // Wrong: std::this_thread::sleep_for(std::chrono::milliseconds(200));
  // Correct:
  @autoreleasepool {
      [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode
          beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.2]];
  }
  ```

- **Output-only sub-devices** — `QueryInterface` for `IDeckLinkInput` succeeds
  on output-only devices, but `EnableVideoInput` fails. Filter first (section 2).

- **Missing DeckLinkAPIDispatch.cpp** — Headers alone aren't enough. Compile and
  link this file or you get undefined symbols. See
  [Build Configuration](references/build-configuration.md).

- **GetDisplayName returns CFStringRef on macOS** — Not `const char*`. Convert
  with `CFStringGetCString`, then `CFRelease`. Forgetting `CFRelease` leaks.

## 10. Build Setup

Minimum Makefile for a DeckLink capture project:

```makefile
CXX = clang++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra
OBJCFLAGS = -fobjc-arc

# Set via: make DECKLINK_INC=/path/to/DeckLinkSDK/Mac/include
DECKLINK_INC ?=

FRAMEWORKS = -framework Foundation -framework CoreFoundation \
             -F/Library/Frameworks -framework DeckLinkAPI

SOURCES = main.mm
DISPATCH_OBJ = build/DeckLinkAPIDispatch.o

all: check-sdk build/capture

check-sdk:
ifeq ($(DECKLINK_INC),)
	$(error Set DECKLINK_INC to DeckLink SDK include directory)
endif

build/DeckLinkAPIDispatch.o:
	@mkdir -p build
	$(CXX) $(CXXFLAGS) -I"$(DECKLINK_INC)" \
	    -c "$(DECKLINK_INC)/DeckLinkAPIDispatch.cpp" -o $@

build/capture: $(SOURCES) $(DISPATCH_OBJ)
	$(CXX) $(CXXFLAGS) $(OBJCFLAGS) -I"$(DECKLINK_INC)" \
	    -o $@ $^ $(FRAMEWORKS)

clean:
	rm -rf build
```

For multi-file builds, test targets, and conditional DeckLink inclusion, see
[Build Configuration](references/build-configuration.md).

## 11. Minimal Complete Example

Working program — discovers device, captures 100 frames, prints average luma:

```cpp
// capture_example.mm — Build with Makefile from section 10
#include "DeckLinkAPI.h"
#import <Foundation/Foundation.h>
#include <atomic>
#include <cstdio>
#include <cstdint>

class FrameCounter : public IDeckLinkInputCallback {
    std::atomic<int32_t> ref_count_{1};
    std::atomic<int> frames_{0};
    int target_;
public:
    FrameCounter(int n) : target_(n) {}
    int count() const { return frames_.load(); }
    bool done() const { return frames_.load() >= target_; }

    HRESULT QueryInterface(REFIID, void**) override { return E_NOINTERFACE; }
    ULONG AddRef() override { return ++ref_count_; }
    ULONG Release() override {
        auto c = --ref_count_; if (c == 0) delete this; return c;
    }
    HRESULT VideoInputFormatChanged(BMDVideoInputFormatChangedEvents,
        IDeckLinkDisplayMode*, BMDDetectedVideoInputFormatFlags) override {
        return S_OK;
    }
    HRESULT VideoInputFrameArrived(
        IDeckLinkVideoInputFrame* vf, IDeckLinkAudioInputPacket*) override {
        if (!vf) return S_OK;

        IDeckLinkVideoBuffer* buf = nullptr;
        if (vf->QueryInterface(IID_IDeckLinkVideoBuffer,
                               (void**)&buf) != S_OK) return S_OK;
        buf->StartAccess(bmdBufferAccessRead);
        void* bytes = nullptr;
        buf->GetBytes(&bytes);
        if (bytes) {
            auto* px = static_cast<const uint8_t*>(bytes);
            int w = vf->GetWidth(), h = vf->GetHeight(), rb = vf->GetRowBytes();
            uint64_t sum = 0;
            for (int y = 0; y < h; y++) {
                const uint8_t* row = px + y * rb;
                for (int x = 0; x < w; x++) sum += row[x * 2 + 1]; // Y byte
            }
            printf("Frame %d: %dx%d luma=%.1f\n", frames_.load(), w, h,
                   (double)sum / (w * h));
        }
        buf->EndAccess(bmdBufferAccessRead);
        buf->Release();
        frames_++;
        return S_OK;
    }
};

int main() {
    @autoreleasepool {
        // 1. Find first capture-capable device (sections 2-3)
        IDeckLinkIterator* iter = CreateDeckLinkIteratorInstance();
        if (!iter) { fprintf(stderr, "No DeckLink drivers\n"); return 1; }

        IDeckLink* dev = nullptr;
        IDeckLinkInput* input = nullptr;
        while (iter->Next(&dev) == S_OK) {
            IDeckLinkProfileAttributes* a = nullptr;
            if (dev->QueryInterface(IID_IDeckLinkProfileAttributes,
                                    (void**)&a) == S_OK) {
                int64_t io = 0; a->GetInt(BMDDeckLinkVideoIOSupport, &io);
                a->Release();
                if (io & bmdDeviceSupportsCapture) {
                    dev->QueryInterface(IID_IDeckLinkInput, (void**)&input);
                    break;
                }
            }
            dev->Release(); dev = nullptr;
        }
        iter->Release();
        if (!input) { fprintf(stderr, "No capture device\n"); return 1; }

        // 2. Auto-detect signal (section 3)
        BMDDisplayMode modes[] = { bmdModeHD1080p30, bmdModeHD1080p2997,
            bmdModeHD1080p25, bmdModeHD1080i5994, bmdModeHD720p5994 };
        bool ok = false;
        for (auto m : modes)
            if (input->EnableVideoInput(m, bmdFormat8BitYUV,
                                        bmdVideoInputFlagDefault) == S_OK)
                { ok = true; break; }
        if (!ok) { fprintf(stderr, "No signal\n"); return 1; }

        // 3. Capture (section 6) — pump NSRunLoop (section 9)
        auto* cb = new FrameCounter(100);
        input->SetCallback(cb);
        input->StartStreams();
        while (!cb->done()) {
            @autoreleasepool {
                [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode
                    beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
            }
        }

        // 4. Clean teardown (section 5)
        input->StopStreams();
        input->DisableVideoInput();
        input->SetCallback(nullptr);
        input->Release(); dev->Release(); cb->Release();
        printf("Done: %d frames\n", cb->count());
    }
    return 0;
}
```

## 12. References

- [Objective-C++ Bridging Patterns](references/objcpp-bridging.md) — CGFloat
  vs double, dispatch_async copy semantics, alive_ lifecycle pattern
- [UYVY Color Math](references/uyvy-color-math.md) — Byte-level UYVY layout,
  ROI luma extraction, BT.709 RGB conversion
- [Signal Detection](references/signal-detection.md) — Mode cycling probe,
  NSRunLoop pumping, VideoInputFormatChanged
- [Thread Safety](references/thread-safety.md) — Callback thread contract,
  mutex lock ordering, snapshot pattern, lifecycle guards
- [Build Configuration](references/build-configuration.md) — Complete Makefile,
  SDK paths, framework linking, conditional compilation
