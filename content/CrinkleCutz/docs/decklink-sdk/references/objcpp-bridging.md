# Objective-C++ Bridging Patterns for DeckLink

When integrating the DeckLink SDK into a macOS application, you inevitably cross
the C++/Objective-C boundary. These patterns prevent the most common crashes and
type corruption bugs.

## CGFloat vs double

`CGFloat` is `double` on 64-bit macOS, but `std::min`/`std::max` fail with it
due to template type deduction. The compiler sees `CGFloat` and `double` as
different types, causing implicit conversion that can corrupt values:

```cpp
// WRONG — template deduction failure, potential memory corruption
CGFloat width = std::min(screenWidth, 1000.0);
CGFloat height = std::max(screenHeight, 600.0);

// CORRECT — explicit ternary, no template ambiguity
CGFloat width = (screenWidth < 1000.0) ? screenWidth : 1000.0;
CGFloat height = (screenHeight > 600.0) ? screenHeight : 600.0;
```

**Rule**: Use `CGFloat` only inside `#ifdef __OBJC__` blocks. Use `double` in
pure C++ headers. When passing values across the boundary, assign to a `double`
local first.

## Header Classification

Classify every header at the top to prevent accidental ObjC imports in pure C++
compilation units:

```cpp
// Pure C++ — no ObjC dependency
// (luma_math.h, capture_callback.h, capture_source.h)
#pragma once
#include <cstdint>
#include <vector>

// Mixed — C++ class with ObjC members behind guards
// (monitor_dashboard.h, preview_window.h)
#ifndef DASHBOARD_H
#define DASHBOARD_H
#include <string>

class Dashboard {
    std::string title_;
#ifdef __OBJC__
    NSWindow* window_;      // Only visible in .mm compilation
    NSTextField* label_;
#endif
public:
    void show();
    void hide();
};
#endif

// Pure ObjC (guarded) — entire content inside guard
// (dashboard_views.h, timeline_graph_view.h)
#ifdef __OBJC__
#import <AppKit/AppKit.h>
@interface LogoGlowView : NSView
@end
#endif
```

## dispatch_async Copy Semantics

Objective-C blocks capture C++ variables by copy. But `const&` parameters are
captured by reference to the original — which may be dead by the time the block
executes:

```cpp
// WRONG — stats is a dangling reference when block runs
void updateUI(const FrameStats& stats) {
    dispatch_async(dispatch_get_main_queue(), ^{
        label.stringValue = [NSString stringWithFormat:@"%d", stats.frame_count];
        // stats reference is now dangling!
    });
}

// CORRECT — copy before async, block owns the copy
void updateUI(const FrameStats& stats) {
    FrameStats stats_copy = stats;
    dispatch_async(dispatch_get_main_queue(), ^{
        label.stringValue = [NSString stringWithFormat:@"%d",
                             stats_copy.frame_count];
    });
}
```

This applies to `std::string`, any struct, and any C++ object passed by
reference. The block's implicit copy happens at the point of block creation, but
references are copied as references, not as values.

## Lifecycle-Safe dispatch_async — The alive_ Pattern

When a C++ object dispatches work to the main queue, the object may be destroyed
before the block runs. Use `shared_ptr<atomic<bool>>` to guard:

```cpp
class PreviewWindow {
    std::shared_ptr<std::atomic<bool>> alive_ =
        std::make_shared<std::atomic<bool>>(true);

    void scheduleUpdate() {
        auto alive = alive_;  // Copy shared_ptr into block
        dispatch_async(dispatch_get_main_queue(), ^{
            if (!*alive) return;  // Object was destroyed
            // Safe to use 'this' here
            this->redraw();
        });
    }

    ~PreviewWindow() {
        *alive_ = false;
        // Synchronous cleanup on main thread
        dispatch_sync(dispatch_get_main_queue(), ^{
            // Tear down UI...
        });
    }
};
```

**Key points**:
- `alive_` is a `shared_ptr` so the atomic bool outlives the object
- The block captures the `shared_ptr` by value (extending its lifetime)
- The destructor sets `*alive_ = false` THEN does synchronous cleanup
- Use `dispatch_sync` (never `dispatch_async`) in destructors

## Destructor Cleanup Order

When a C++ object owns ObjC views that hold back-references (delegates,
targets), clean up in this exact order:

```cpp
~MyWindow() {
    void (^cleanup)(void) = ^{
        // 1. Clear back-references FIRST
        if (delegate_) delegate_.owner = nil;
        if (view_) view_.owner = nil;

        // 2. Clear delegate
        if (window_) [window_ setDelegate:nil];

        // 3. Now safe to close
        if (window_) {
            [window_ orderOut:nil];
            [window_ close];
            window_ = nil;
        }
    };

    if ([NSThread isMainThread]) cleanup();
    else dispatch_sync(dispatch_get_main_queue(), cleanup);
}
```

## C++ Lambdas and ARC

C++ lambdas cannot capture addresses of ARC-managed Objective-C member
variables. This fails:

```cpp
// WRONG — cannot take address of autoreleasing parameter
auto setup = [&](NSTextField* label, NSString* text) {
    label.stringValue = text;  // Compiler error under ARC
};
```

Use inline code instead. When creating multiple similar UI elements, the
repetition is preferable to the compilation failure.

## NSWindow Lifecycle with ARC

Set `releasedWhenClosed = NO` for any `NSWindow` whose pointer is held as a
strong reference. Otherwise, closing the window triggers a double-free (ARC
releases + NSWindow releases itself):

```cpp
window_ = [[NSWindow alloc] initWithContentRect:frame ...];
window_.releasedWhenClosed = NO;  // Critical for ARC

// Every closable window needs a delegate that handles close
window_.delegate = delegate_;
// In delegate: windowWillClose: sets the window pointer to nil
```
