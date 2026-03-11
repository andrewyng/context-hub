# Build Configuration

## SDK Components

The DeckLink SDK requires three things at build time:

1. **Headers** (`DeckLinkAPI.h` and friends) — provided in the SDK download
2. **DeckLinkAPIDispatch.cpp** — provided alongside the headers, must be
   compiled and linked
3. **DeckLinkAPI.framework** — installed at `/Library/Frameworks/` by the
   Desktop Video installer

`DeckLinkAPIDispatch.cpp` contains the implementation of
`CreateDeckLinkIteratorInstance()` and other factory functions. Without it, you
get undefined symbols at link time. This is the most common build mistake.

## Complete Makefile Template

```makefile
PROJECT = my_capture_app
CXX = clang++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra
OBJCFLAGS = -fobjc-arc

# DeckLink SDK include path — set via command line:
#   make DECKLINK_INC=/path/to/DeckLinkSDK/Mac/include
# The directory must contain DeckLinkAPI.h and DeckLinkAPIDispatch.cpp
DECKLINK_INC ?=

# DeckLink framework (installed by Desktop Video)
DECKLINK_FLAGS = -F/Library/Frameworks -framework DeckLinkAPI

# macOS frameworks needed for capture apps
FRAMEWORKS = -framework Foundation -framework CoreFoundation \
             -framework AppKit -framework AVFoundation \
             -framework CoreMedia -framework CoreVideo

# Source files
CPP_SOURCES = src/luma_math.cpp src/config.cpp
MM_SOURCES = src/main.mm src/capture_callback.mm src/decklink_capture.mm

# Object files
BUILD_DIR = build
CPP_OBJECTS = $(CPP_SOURCES:src/%.cpp=$(BUILD_DIR)/%.o)
MM_OBJECTS = $(MM_SOURCES:src/%.mm=$(BUILD_DIR)/%.o)
DISPATCH_OBJ = $(BUILD_DIR)/DeckLinkAPIDispatch.o
ALL_OBJECTS = $(CPP_OBJECTS) $(MM_OBJECTS) $(DISPATCH_OBJ)

all: check-sdk dirs bin/$(PROJECT)

# Validate SDK path is set
check-sdk:
ifeq ($(DECKLINK_INC),)
	$(error DECKLINK_INC not set. Example: make DECKLINK_INC=/path/to/SDK/include)
endif

dirs:
	@mkdir -p $(BUILD_DIR) bin

# Link
bin/$(PROJECT): $(ALL_OBJECTS)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(DECKLINK_FLAGS) $(FRAMEWORKS)

# Compile DeckLinkAPIDispatch.cpp from SDK
$(DISPATCH_OBJ):
	$(CXX) $(CXXFLAGS) -I"$(DECKLINK_INC)" \
	    -c "$(DECKLINK_INC)/DeckLinkAPIDispatch.cpp" -o $@

# Compile C++ sources (pure C++, no ObjC)
$(BUILD_DIR)/%.o: src/%.cpp
	$(CXX) $(CXXFLAGS) -I"$(DECKLINK_INC)" -c $< -o $@

# Compile Objective-C++ sources
$(BUILD_DIR)/%.o: src/%.mm
	$(CXX) $(CXXFLAGS) $(OBJCFLAGS) -I"$(DECKLINK_INC)" -c $< -o $@

clean:
	rm -rf $(BUILD_DIR) bin

# Test target — pure C++ tests, no DeckLink SDK needed
TEST_SOURCES = tests/test_math.cpp src/luma_math.cpp
test: dirs bin/test_math
	./bin/test_math

bin/test_math: $(TEST_SOURCES)
	$(CXX) $(CXXFLAGS) -Isrc -Itests -o $@ $^

.PHONY: all clean test dirs check-sdk
```

Build with:
```bash
make DECKLINK_INC=/Users/you/Developer/Blackmagic/DeckLinkSDK-15.3/Mac/include
```

## Conditional DeckLink Inclusion

If your app supports both DeckLink hardware and other capture sources (e.g.,
USB webcams via AVFoundation), use `__has_include` to make DeckLink optional:

```cpp
#if __has_include("DeckLinkAPI.h")
#include "DeckLinkAPI.h"
#define HAS_DECKLINK 1
#else
#define HAS_DECKLINK 0
#endif

std::vector<DeviceInfo> scanDevices() {
    std::vector<DeviceInfo> devices;

#if HAS_DECKLINK
    IDeckLinkIterator* iter = CreateDeckLinkIteratorInstance();
    if (iter) {
        // Enumerate DeckLink devices...
        iter->Release();
    }
#endif

    // Enumerate webcam devices (always available)...
    return devices;
}
```

This lets test binaries compile without the DeckLink SDK path. Pure C++ math
and config tests don't need the SDK at all.

## Framework Linking

The DeckLink framework installs to `/Library/Frameworks/`. Link with:

```
-F/Library/Frameworks -framework DeckLinkAPI
```

If the framework is not installed (user hasn't installed Desktop Video),
`CreateDeckLinkIteratorInstance()` returns `nullptr` at runtime — it doesn't
crash. This is the designed graceful degradation path.

## SDK Header Warnings

The DeckLink SDK headers generate warnings under strict compiler settings
(`-Wall -Wextra`). These are in Blackmagic's code, not yours. Common warnings:

- Unused parameters in interface default implementations
- Implicit conversions in COM GUID definitions
- Missing override specifiers

These are expected and harmless. Do not suppress them project-wide — instead,
let them pass. They only appear in SDK headers, not your code.

## Incremental Build Pitfall

After significant changes to `.mm` files (especially header changes that affect
class layout), always do a clean build:

```bash
make clean && make DECKLINK_INC=/path/to/SDK/include
```

Incremental builds can produce stale object files that link successfully but
crash at runtime with SIGTRAP (assertion failure). This manifests as crashes
that disappear under the debugger (because lldb changes memory layout/timing).
