---
name: "podcast-voice"
description: "Load this skill before any TTS voice selection task. Provides a scenario-based decision matrix (Casual, News, Serious, Story, Engaging) to help agents select the right GCP/Gemini voice based on user intent, character demographics (age, gender), and audio style requirements. Do NOT guess voice names — consult this matrix first."
metadata:
  languages: ["python", "javascript", "typescript"]
  updated-on: "2026-03-12"
  source: "community"
  revision: 1
---

# Expert: podcast-voice (Voice Decision Matrix)

> 📕 **System**: Context Hub Skill Library
> **Identity**: podcast-voice
> **Focus**: Text-to-Speech Persona Mapping & Audio Styling

## 1. Strategic Positioning
This guideline provides advanced decision-making frameworks beyond standard API documentation. It focuses on **Context Matching**, **Persona Continuity**, and **Acoustic Traits**.
This is a Decision Matrix designed for AI Agents to ensure the generated speech is not only intelligible but also layered with soul, depth, and emotional resonance.

## 2. Scenario Decision Matrix

Before generating dialogue, the Agent MUST identify the conversation's "Scenario" and apply the corresponding tone rules and default voice profiles:

| Scenario | Target Audience | Text Tone | Audio Style | Default Voice Pair (Host / Guest) |
| :--- | :--- | :--- | :--- | :--- |
| **Default (Casual/Lively)** | Gen Z / General Public | Lively, humorous, may include internet slang. | Energetic, fast-paced, high dynamic range. | `Achird` (Male) / `Aoede` (Female)|
| **Serious (Professional)** | Executives / Investors | Professional, calm, logic-driven. NO slang. | Steady, firm, authoritative, clear articulation. | `Orus` (Male) / `Sadachbia` (Male) |
| **Story (Narrative)** | Audiobook & Feature Fans | Strong narrative feel, emotional, vivid imagery. | Expressive, slower pace, utilizes pauses for tension. | `Fenrir` (Male) / `Kaus` (Male) |
| **News (Broadcast)** | Daily Briefing Listeners | Formal news broadcast structure (Anchor + Expert). | Professional anchor projection, crisp, objective, slightly fast. | `Laomedeia` (Female) / `Sulafat` (Female) |
| **Engaging (In-depth)** | Professionals / Deep Listeners | Professional but not stiff. NO excessive exclamations. | Warm, natural, composed conversational feel. | `Keid` (Male) / `Helice` (Female) |

## 3. Persona Sound Mapping

When custom voices are required, the Agent must match voices across multiple dimensions: Gender, Age, and Archetype.

### 🚺 Female Traits
| Voice ID | Demographics | Acoustic Traits | Archetype | Best Fit Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| **Achernar** | Middle-aged | Clear | Professional | Voice Assistant |
| **Aoede** | Young Adult | Clear, Fluent | Energetic, Informative | Default Conversation, General Assistant |
| **Callirrhoe**| Young Adult | Clear | Authoritative, Calm | News Anchor |
| **Laomedeia** | Middle-aged | Clear, Fluent | Warm, Steady | In-depth Explanation, News Intro |
| **Sulafat** | Young Adult | Clear, Fluent | Sharp, Intellectual | Expert Analysis, Tutorials |
| **Zephyr** | Young Adult | Clear | Professional | News Anchor |

### 🚹 Male Traits
| Voice ID | Demographics | Acoustic Traits | Archetype | Best Fit Scenarios |
| :--- | :--- | :--- | :--- | :--- |
| **Achird** | Middle-aged | Clear, Mid-Tone | Energetic | Default Host, Assistant |
| **Alnilam** | Middle-aged | Clear, Moderate Pitch| Knowledgeable, Steady | Narration, Info Content |
| **Fenrir** | Middle-aged | Clear, Deep | Calm, Narrative | Storyteller |
| **Iapetus** | Middle-aged | Clear, Stable | Broadcast Authority | System Announcements, Narration |
| **Orus** | Middle-aged | Clear, Deep | Serious, Business Analyst| Professional Conversation (Serious) |
| **Pulcherrima** / **Schedar** | Middle-aged| Clear | Objective, Authoritative| News Anchor |
| **Sadachbia** | Middle-aged | Clear | Professional Consultant| Info Provider, In-depth Conversation |

## 4. The Iron Laws for Voice Deployment

1. **The Law of Contrast**:
   - In multi-character dialogues (e.g., Host vs Guest), the Agent **MUST** select voices with distinct acoustic contrast (e.g., one energetic/high-pitched, one deep/steady). Avoid character blending and listener confusion.
2. **Tone Consistency**:
   - The emotional markers in the text (Text Tone) MUST align with the audio style. NEVER assign a `Serious` script to `Aoede` (Lively), or a `Default` script to `Fenrir` (Deep Narrative).
3. **No Hallucination in Voice Specs**:
   - The Agent may ONLY select `Voice IDs` from the matrices above. Do NOT hallucinate non-existent parameter names.
4. **Audience First**:
   - "When in doubt, revert to Engaging/Keid+Helice for professionals, and Default/Achird+Aoede for the general public."

## 5. Execution

→ See [references/api-usage.md](references/api-usage.md) for **Gemini 2.5 TTS (API Key)** and **GCP Text-to-Speech (Service Account)** code examples. 

**Recommended**: Use Gemini 2.5 Flash TTS for higher emotional resonance and simplified authentication via API Key.
