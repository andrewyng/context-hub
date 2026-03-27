---
name: media-translation
description: "Google Cloud Media Translation Python client for bidirectional streaming speech translation"
metadata:
  languages: "python"
  versions: "0.13.0"
  revision: 1
  updated-on: "2026-03-13"
  source: maintainer
  tags: "google-cloud-media-translation,google-cloud,translation,speech,streaming,gcp,python"
---

# Google Cloud Media Translation Python Package Guide

Use `google-cloud-media-translation` when you need Google Cloud's Media Translation API from Python. This package is narrow by design: the Python surface is the `mediatranslation_v1beta1` client for bidirectional streaming speech translation, not a general text-translation SDK.

If you need text translation, glossaries, document translation, or batch translation jobs, use `google-cloud-translate` instead.

## Install

Pin the package version if you want behavior to match this guide:

```bash
python -m pip install --upgrade pip
python -m pip install "google-cloud-media-translation==0.13.0"
```

Common alternatives:

```bash
uv add "google-cloud-media-translation==0.13.0"
poetry add "google-cloud-media-translation==0.13.0"
```

PyPI currently classifies the package as Beta and publishes the client under the `v1beta1` namespace.

## Authentication And Environment

Google Cloud client libraries use Application Default Credentials (ADC). For local development, the practical options are:

```bash
gcloud auth application-default login
```

Or point the client at a service account JSON file:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
```

Use a principal that can call Media Translation in the target Google Cloud project. Prefer ADC or attached service accounts over hard-coding credentials in Python.

## Initialize The Client

```python
from google.cloud import mediatranslation_v1beta1 as media_translation

client = media_translation.SpeechTranslationServiceClient()
```

The default endpoint is `mediatranslation.googleapis.com:443`. If your environment needs custom endpoint selection or mTLS behavior, pass `client_options` when you construct the client.

## Core Workflow: Stream Audio And Read Translations

`streaming_translate_speech()` is the main API call. The request stream has one important rule:

- The first message must contain `streaming_config` and no audio bytes.
- All later messages must contain `audio_content` and no config.

This example streams raw 16 kHz mono PCM (`LINEAR16`) from a local file and prints interim and final translated text:

```python
from typing import Iterator

from google.cloud import mediatranslation_v1beta1 as media_translation


def request_stream(
    audio_path: str,
) -> Iterator[media_translation.StreamingTranslateSpeechRequest]:
    yield media_translation.StreamingTranslateSpeechRequest(
        streaming_config=media_translation.StreamingTranslateSpeechConfig(
            audio_config=media_translation.AudioConfig(
                audio_encoding=media_translation.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
            ),
            source_language_code="en-US",
            target_language_code="es-ES",
            single_utterance=False,
        )
    )

    with open(audio_path, "rb") as audio_file:
        while chunk := audio_file.read(4096):
            yield media_translation.StreamingTranslateSpeechRequest(
                audio_content=chunk
            )


def translate_stream(audio_path: str) -> None:
    client = media_translation.SpeechTranslationServiceClient()
    responses = client.streaming_translate_speech(
        requests=request_stream(audio_path)
    )

    for response in responses:
        event = response.WhichOneof("streaming_response")

        if event == "error":
            raise RuntimeError(
                f"Media Translation error {response.error.code}: "
                f"{response.error.message}"
            )

        if event == "result":
            result = response.result
            status = "final" if result.is_final else "interim"
            message_type = result.WhichOneof("message_type")

            if message_type == "text_translation_result":
                print(
                    f"[{status}] "
                    f"{result.text_translation_result.translation}"
                )
            elif message_type == "recognition_result":
                print(f"[{status}] {result.recognition_result.text}")


translate_stream("speech.raw")
```

Adjust these fields for your real stream:

- `audio_encoding`: use an encoding that matches the actual audio bytes you send
- `sample_rate_hertz`: match the source stream's sample rate
- `source_language_code`: BCP-47 language tag for the spoken input
- `target_language_code`: BCP-47 language tag for the translation output
- `single_utterance`: set `True` if you want the server to stop after one utterance

## Async Client

If the rest of your app is async, use the async client with the same request messages:

```python
from google.cloud import mediatranslation_v1beta1 as media_translation

client = media_translation.SpeechTranslationServiceAsyncClient()
```

The streaming request structure stays the same; only the client call pattern changes.

## Common Pitfalls

- Do not send audio bytes in the first request. The API expects config first, then audio chunks.
- Do not keep resending `streaming_config` after the first message. Subsequent messages should only carry `audio_content`.
- `audio_content` is raw bytes. Do not base64-encode it.
- Make sure `audio_encoding` and `sample_rate_hertz` match the real stream. A mismatched config is a common cause of bad transcripts or request failures.
- This package is not a replacement for `google-cloud-translate`. The Media Translation client is specifically for streaming speech translation.
- The package is still a beta client surface (`mediatranslation_v1beta1`), so keep an eye on release notes before upgrading across minor versions.

## Version Notes For 0.13.0

- PyPI lists `0.13.0` as the current package version for this guide.
- The import surface remains `google.cloud.mediatranslation_v1beta1`.
- PyPI classifiers currently advertise support for Python 3.7 through 3.14.

## Official Sources

- PyPI package: https://pypi.org/project/google-cloud-media-translation/
- Maintainer README: https://raw.githubusercontent.com/googleapis/google-cloud-python/main/packages/google-cloud-media-translation/README.rst
- Python reference index: https://cloud.google.com/python/docs/reference/mediatranslation/latest
- Client reference: https://cloud.google.com/python/docs/reference/mediatranslation/latest/google.cloud.mediatranslation_v1beta1.services.speech_translation_service.SpeechTranslationServiceClient
- Type reference: https://cloud.google.com/python/docs/reference/mediatranslation/latest/google.cloud.mediatranslation_v1beta1.types.StreamingTranslateSpeechResponse
- ADC overview: https://cloud.google.com/docs/authentication/provide-credentials-adc
