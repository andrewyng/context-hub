# Thread Safety

The DeckLink SDK delivers frame callbacks on a background thread owned by the
SDK. Your callback code runs concurrently with your UI thread and any other
threads in your application. Getting thread safety wrong here causes data races,
crashes, and subtle corruption.

## Callback Thread Contract

`VideoInputFrameArrived` is called on a DeckLink-owned background thread. Key
rules:

- The callback thread is **not the main thread** — you cannot call AppKit/UIKit
  directly
- The callback is **serialized** — the SDK will not call VideoInputFrameArrived
  concurrently with itself (one frame at a time)
- The callback must return promptly — blocking the callback thread stalls the
  capture pipeline and may drop frames
- The frame buffer pointer is only valid for the duration of the callback (or
  between StartAccess/EndAccess for SDK 15.3)

If you extract the frame processing into a shared function (e.g., for multiple
capture backends), document the thread contract:

```cpp
// Thread contract: must be called from a single producer thread.
// Not reentrant. Callers must not call concurrently.
void processFrame(const uint8_t* bytes, int width, int height, int rowBytes);
```

## Mutex Lock Ordering

When multiple mutexes protect different data that must be accessed together,
define and document a strict lock ordering. Violating the order causes deadlocks:

```cpp
class CaptureCallback {
    // Lock ordering: config_mutex -> stats_mutex
    // Both VideoInputFrameArrived and updateConfig follow this order.
    mutable std::mutex config_mutex;
    mutable std::mutex stats_mutex;

    MonitorConfig config;
    FrameStats stats;

public:
    void processFrame(const uint8_t* bytes, int w, int h, int rb) {
        // Lock config first, then stats (matches declared order)
        std::lock_guard<std::mutex> cfg_lock(config_mutex);
        MonitorConfig config_snapshot = config;

        std::lock_guard<std::mutex> stats_lock(stats_mutex);
        stats.frame_count++;

        // Process ROIs using config_snapshot and update stats...
    }

    void updateConfig(const MonitorConfig& new_config) {
        // Same order: config first, then stats
        std::lock_guard<std::mutex> cfg_lock(config_mutex);
        bool roi_count_changed = (new_config.rois.size() != config.rois.size());
        config = new_config;

        if (roi_count_changed) {
            std::lock_guard<std::mutex> stats_lock(stats_mutex);
            stats.initForROICount(config.rois.size());
        }
    }
};
```

**Why this matters**: `processFrame` (callback thread) reads config and writes
stats. `updateConfig` (UI thread) writes config and may resize stats. Without
consistent lock ordering, thread A locks config then waits for stats, while
thread B locks stats then waits for config — deadlock.

## Snapshot Pattern

Return copies of shared data rather than references. This allows the caller to
read without holding a lock:

```cpp
// Thread-safe: returns copy under lock
FrameStats getStats() const {
    std::lock_guard<std::mutex> lock(stats_mutex);
    return stats;  // Copy
}

MonitorConfig getConfig() const {
    std::lock_guard<std::mutex> lock(config_mutex);
    return config;  // Copy
}
```

The caller gets a consistent snapshot. The lock is held only for the duration of
the copy, not while the caller processes the data.

## shared_ptr<atomic<bool>> Lifecycle Guard

When dispatching work from a callback thread to the main thread, the owning
object may be destroyed before the dispatched block runs. The `alive_` pattern
prevents use-after-free:

```cpp
class CaptureSystem {
    std::shared_ptr<std::atomic<bool>> alive_ =
        std::make_shared<std::atomic<bool>>(true);

    void onFrameReceived(const FrameData& data) {
        // Copy data AND alive_ into block
        FrameData data_copy = data;
        auto alive = alive_;

        dispatch_async(dispatch_get_main_queue(), ^{
            if (!*alive) return;  // Owner destroyed, bail out
            updateUI(data_copy);
        });
    }

    ~CaptureSystem() {
        *alive_ = false;
        // Synchronous drain — ensures no pending blocks access 'this'
        dispatch_sync(dispatch_get_main_queue(), ^{
            teardownUI();
        });
    }
};
```

**Why shared_ptr**: The atomic bool must outlive the object. `shared_ptr` ensures
the bool stays alive as long as any block holds a reference to it. Using a raw
member `atomic<bool>` would be a use-after-free because the bool is destroyed
with the object.

## condition_variable for Alert Queuing

Instead of polling (sleep + check), use `condition_variable` for zero-CPU idle
wait:

```cpp
class AlertSystem {
    std::queue<Alert> alert_queue;
    std::mutex queue_mutex;
    std::condition_variable alert_cv;
    std::atomic<bool> running{true};
    std::thread alert_thread;

    void alertWorkerThread() {
        while (running) {
            Alert alert;
            bool has_alert = false;

            {
                std::unique_lock<std::mutex> lock(queue_mutex);
                alert_cv.wait(lock, [this] {
                    return !alert_queue.empty() || !running;
                });
                if (!running && alert_queue.empty()) break;
                if (!alert_queue.empty()) {
                    alert = alert_queue.front();
                    alert_queue.pop();
                    has_alert = true;
                }
            }

            if (has_alert) {
                dispatchAlert(alert);
            }
        }
    }

    void enqueueAlert(const Alert& alert) {
        {
            std::lock_guard<std::mutex> lock(queue_mutex);
            alert_queue.push(alert);
        }
        alert_cv.notify_one();  // Wake worker
    }

    void stop() {
        running = false;
        alert_cv.notify_one();  // Unblock worker
        if (alert_thread.joinable()) alert_thread.join();
    }
};
```

**Why not sleep-poll**: A 50ms sleep loop wastes CPU cycles and adds up to 50ms
latency. `condition_variable::wait` uses zero CPU when idle and wakes instantly
on `notify_one`.

## Alert Callback Thread Safety

If external code registers callbacks that fire on alerts, protect the callback
list with its own mutex (separate from the queue mutex to avoid lock ordering
issues):

```cpp
std::vector<AlertCallback> alert_callbacks;
std::mutex alert_cb_mutex;

void addAlertCallback(AlertCallback cb) {
    std::lock_guard<std::mutex> lock(alert_cb_mutex);
    alert_callbacks.push_back(std::move(cb));
}

void dispatchAlert(const Alert& alert) {
    std::lock_guard<std::mutex> lock(alert_cb_mutex);
    for (const auto& cb : alert_callbacks) {
        cb(alert);
    }
}
```
