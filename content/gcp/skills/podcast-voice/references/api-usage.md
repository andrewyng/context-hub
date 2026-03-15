# API Usage: Generating Speech via Gemini 2.5 TTS / GCP

The Voice IDs in `SKILL.md` (e.g., `Achird`, `Aoede`) are available via both the **Gemini 2.5 TTS API** (Preferred) and the **GCP Text-to-Speech API**.

## Option 1: Gemini 2.5 TTS (Preferred - API Key)

This approach uses your `GOOGLE_API_KEY` and the `google-generativeai` library. It is often simpler for rapid development.

### Prerequisites & Installation

> [!WARNING]
> **API Key Permissions**: The `GOOGLE_API_KEY` used **must** have the **Generative Language API** enabled in Google Cloud Console. A key restricted only to other services (e.g., Custom Search) will result in a `403 Forbidden` error.

```bash
pip install -U google-generativeai
```

### Python Implementation

```python
import google.generativeai as genai
import os

# Set your API Key
genai.configure(api_key="YOUR_GOOGLE_API_KEY")

def synthesize_gemini_audio(text: str, voice_id: str, output_file: str = "output.wav"):
    """
    Synthesizes speech using Gemini 2.5 Flash TTS.
    
    Args:
        text: Input script.
        voice_id: Voice ID from SKILL.md (e.g., 'Achird').
        output_file: Target file (Gemini TTS returns raw PCM/WAV).
    """
    model = genai.GenerativeModel("gemini-2.5-flash") # or gemini-2.5-flash-preview-tts
    
    response = model.generate_content(
        contents=text,
        generation_config={
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {
                        "voice_name": voice_id
                    }
                }
            }
        }
    )
    
    # Handle the audio part of the response
    for part in response.candidates[0].content.parts:
        if part.inline_data and "audio" in part.inline_data.mime_type:
            audio_data = part.inline_data.data
            
            # Gemini TTS often returns raw PCM data (24kHz, 16-bit, mono) without a RIFF header.
            # We must inject a WAV header to make it playable by standard audio players.
            import struct
            sample_rate = 24000
            bits_per_sample = 16
            num_channels = 1
            byte_rate = sample_rate * num_channels * (bits_per_sample // 8)
            block_align = num_channels * (bits_per_sample // 8)
            data_size = len(audio_data)
            
            wav_header = struct.pack('<4sI4s4sIHHIIHH4sI',
                b'RIFF', data_size + 36, b'WAVE',
                b'fmt ', 16, 1, num_channels, sample_rate, byte_rate, block_align, bits_per_sample,
                b'data', data_size
            )
            
            with open(output_file, "wb") as f:
                f.write(wav_header + audio_data)
            print(f"Audio saved to {output_file} (WAV Format injected)")
            return
```

### Node.js Implementation

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

// Set your API Key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function synthesizeGeminiAudio(text, voiceId, outputFile = "output.wav") {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // or gemini-2.5-flash-preview-tts
    
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: voiceId
                    }
                }
            }
        }
    });

    const response = await result.response;
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType.includes("audio")) {
                let audioBuffer = Buffer.from(part.inlineData.data, "base64");
                
                // Gemini TTS often returns raw PCM data (24kHz, 16-bit, mono) without a RIFF header.
                // Inject WAV header
                const sampleRate = 24000;
                const bitsPerSample = 16;
                const numChannels = 1;
                const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
                const blockAlign = numChannels * (bitsPerSample / 8);
                const dataSize = audioBuffer.length;

                const wavHeader = Buffer.alloc(44);
                wavHeader.write("RIFF", 0);
                wavHeader.writeUInt32LE(dataSize + 36, 4);
                wavHeader.write("WAVE", 8);
                wavHeader.write("fmt ", 12);
                wavHeader.writeUInt32LE(16, 16);
                wavHeader.writeUInt16LE(1, 20);
                wavHeader.writeUInt16LE(numChannels, 22);
                wavHeader.writeUInt32LE(sampleRate, 24);
                wavHeader.writeUInt32LE(byteRate, 28);
                wavHeader.writeUInt16LE(blockAlign, 32);
                wavHeader.writeUInt16LE(bitsPerSample, 34);
                wavHeader.write("data", 36);
                wavHeader.writeUInt32LE(dataSize, 40);

                audioBuffer = Buffer.concat([wavHeader, audioBuffer]);
                
                fs.writeFileSync(outputFile, audioBuffer);
                console.log(`Audio saved to ${outputFile} (WAV Format injected)`);
                return;
            }
        }
    }
}
```

---

## Option 2: GCP Text-to-Speech (Legacy - Service Account)

Use this if you require specific GCP features or are using a Service Account JSON.

### Installation

```bash
pip install google-cloud-texttospeech
```

### Python Implementation

```python
from google.cloud import texttospeech_v1beta1

def synthesize_gcp_audio(text: str, voice_id: str, output_file: str = "output.mp3"):
    client = texttospeech_v1beta1.TextToSpeechClient()
    synthesis_input = texttospeech_v1beta1.SynthesisInput(text=text)
    
    voice = texttospeech_v1beta1.VoiceSelectionParams(
        language_code="cmn-TW", # Adjust to your target language
        name=voice_id,
    )

    audio_config = texttospeech_v1beta1.AudioConfig(
        audio_encoding=texttospeech_v1beta1.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    with open(output_file, "wb") as out:
        out.write(response.audio_content)
```
