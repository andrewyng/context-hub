# UYVY Color Math

## Byte-Level Memory Layout

DeckLink's `bmdFormat8BitYUV` delivers frames in UYVY 4:2:2 format. Each pair
of pixels occupies 4 bytes:

```
Offset:  0    1    2    3    4    5    6    7   ...
         U0   Y0   V0   Y1   U2   Y2   V2   Y3  ...
         |----pair 0----|    |----pair 1----|
```

- **U** (Cb): Blue-difference chroma, shared between two pixels
- **Y**: Luma (brightness) — one per pixel
- **V** (Cr): Red-difference chroma, shared between two pixels
- **2 bytes per pixel**, but always accessed in pairs of 4 bytes
- Pixels at even x-coordinates have Y at byte offset 1; odd x at byte offset 3

Row stride (`GetRowBytes()`) may include padding beyond `width * 2`. Always use
the actual row bytes value for row addressing.

## ROI Luma Extraction

To compute the average brightness of a rectangular region of interest (ROI)
within a UYVY frame:

```cpp
double computeROILumaFromUYVY(const uint8_t* buffer, int width, int height,
                               int rowBytes, int roiX, int roiY,
                               int roiW, int roiH) {
    // Clamp ROI to frame boundaries
    int rx0 = std::clamp(roiX, 0, width - 1);
    int ry0 = std::clamp(roiY, 0, height - 1);
    int rx1 = std::clamp(roiX + roiW, rx0 + 1, width);
    int ry1 = std::clamp(roiY + roiH, ry0 + 1, height);

    uint64_t sum_y = 0;
    uint64_t count = 0;

    for (int y = ry0; y < ry1; y++) {
        const uint8_t* row = buffer + y * rowBytes;

        // Align to even pixel boundary for UYVY pairs
        int x_start = (rx0 & ~1);

        for (int x = x_start; x < rx1; x += 2) {
            int byte_idx = x * 2;

            // Extract Y0 (even pixel)
            if (x >= rx0 && x < rx1) {
                sum_y += row[byte_idx + 1];
                count++;
            }
            // Extract Y1 (odd pixel)
            if ((x + 1) >= rx0 && (x + 1) < rx1) {
                sum_y += row[byte_idx + 3];
                count++;
            }
        }
    }

    return (count > 0) ? static_cast<double>(sum_y) / count : 0.0;
}
```

**Key details**:
- ROI x-start must align to even boundary (`& ~1`) since UYVY pairs start at
  even pixels
- Use `uint64_t` for the accumulator — a 1920x1080 ROI sums ~2M values of
  0-255, which fits in 32 bits, but larger ROIs or multi-frame accumulation need
  64 bits
- `std::clamp` (C++17) prevents out-of-bounds reads

## BT.709 UYVY to RGB Conversion

For HD content (720p and above), use the BT.709 color matrix. Integer-only math
avoids floating-point overhead in per-pixel loops:

```cpp
std::vector<uint8_t> convertUYVYtoRGB(const uint8_t* uyvy_data,
                                       int width, int height, int row_bytes) {
    std::vector<uint8_t> rgb(width * height * 3);

    for (int y = 0; y < height; y++) {
        const uint8_t* row = uyvy_data + y * row_bytes;
        for (int x = 0; x < width; x += 2) {
            int idx = x * 2;

            int u  = row[idx + 0] - 128;
            int y0 = row[idx + 1] - 16;
            int v  = row[idx + 2] - 128;
            int y1 = row[idx + 3] - 16;

            // BT.709 coefficients scaled to integer math (>>8 = /256)
            // R = 1.164(Y-16) + 1.793(V-128)
            // G = 1.164(Y-16) - 0.213(U-128) - 0.533(V-128)
            // B = 1.164(Y-16) + 2.112(U-128)
            int r0 = std::clamp((298 * y0 + 459 * v + 128) >> 8, 0, 255);
            int g0 = std::clamp((298 * y0 - 55 * u - 136 * v + 128) >> 8,
                                0, 255);
            int b0 = std::clamp((298 * y0 + 541 * u + 128) >> 8, 0, 255);

            int r1 = std::clamp((298 * y1 + 459 * v + 128) >> 8, 0, 255);
            int g1 = std::clamp((298 * y1 - 55 * u - 136 * v + 128) >> 8,
                                0, 255);
            int b1 = std::clamp((298 * y1 + 541 * u + 128) >> 8, 0, 255);

            int rgb_idx = (y * width + x) * 3;
            rgb[rgb_idx]     = r0;
            rgb[rgb_idx + 1] = g0;
            rgb[rgb_idx + 2] = b0;

            if (x + 1 < width) {
                rgb[rgb_idx + 3] = r1;
                rgb[rgb_idx + 4] = g1;
                rgb[rgb_idx + 5] = b1;
            }
        }
    }
    return rgb;
}
```

**Notes on the integer coefficients**:
- `298 = 1.164 * 256`, `459 = 1.793 * 256`, `55 = 0.213 * 256`,
  `136 = 0.533 * 256`, `541 = 2.112 * 256`
- The `+ 128` before `>> 8` provides rounding (equivalent to `+ 0.5` before
  truncation)
- `std::clamp` handles out-of-range values from super-white or super-black
  signals
- BT.601 (SD content) uses different coefficients — only use BT.709 for HD

## EMA Baseline Smoothing

For change detection (monitoring luma drift over time), use an exponential
moving average to establish a stable baseline:

```cpp
double updateEMABaseline(double current_baseline, double new_value,
                         double alpha) {
    return current_baseline * (1.0 - alpha) + new_value * alpha;
}
```

- **alpha = 0.02** works well at ~30fps (slow adaptation, stable baseline)
- Lower frame rates (webcams at 15fps) may need higher alpha for equivalent
  responsiveness
- Initialize baseline to the first observed value, then apply EMA from frame 2
  onward
