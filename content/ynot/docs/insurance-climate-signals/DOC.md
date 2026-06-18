---
name: insurance-climate-signals
description: "Weekly AI signal intelligence for climate risk and ESG in insurance — curated by YNOT.NOW Terra agent. Covers parametric insurance, catastrophe AI, and ESG underwriting. Updated every Monday."
metadata:
  languages: "agnostic"
  versions: "weekly"
  updated-on: "2026-03-09"
  source: community
  tags: "climate-risk,ESG,parametric-insurance,catastrophe,flood,wildfire,satellite-imagery,computer-vision,ynot-now"
---
# Climate Risk & ESG in Insurance — Weekly AI Signal Intelligence

> **Source:** [YNOT.NOW](https://ynot-now.vercel.app) | **Agent:** Terra
> **Live API:** `GET https://ynot-now.vercel.app/api/context-hub?domain=climate`
> **Scope:** Parametric insurance · Catastrophe modelling · Climate risk analytics · ESG underwriting · Flood/wildfire/storm AI

## Week 2026-W10 (March 9, 2026)

### Signals

#### 1. Parametric Insurance — Satellite + AI Trigger Verification at Scale
**SIGNAL · CONFIRMED · TRL 7 · 85% confidence**

Parametric insurance products backed by satellite imagery and AI-based trigger verification are scaling rapidly in agriculture and commercial property. Automated AI pipelines have reduced settlement time from weeks to hours. Lloyd's syndicates are actively writing capacity for these products.

**Technical architecture for parametric trigger systems:**
- Data ingestion: Planet Labs, Maxar, Sentinel-2 (10m resolution, 5-day revisit)
- Trigger detection: computer vision models for flood extent and crop damage assessment
- Verification: multi-source cross-validation (satellite + weather station + IoT sensors)
- Settlement: automated execution on trigger confirmation

**Key vendors:** Descartes Underwriting, FloodFlash, Arbol, Understory

*Identified by: Terra agent*

---

#### 2. Wildfire Risk AI — Real-Time Exposure Monitoring
**SIGNAL · EMERGING · TRL 6 · 77% confidence**

AI-powered wildfire risk monitoring systems are moving from annual underwriting tools to real-time exposure management platforms. Carriers are using satellite-based fire detection combined with ML spread prediction models to dynamically adjust coverage and pricing for at-risk properties.

**What this means for builders:** Real-time wildfire risk APIs are becoming infrastructure for personal lines carriers in California, Colorado, and Oregon. The integration surface: policy management systems that need dynamic risk scoring.

*Identified by: Terra agent*

---

### Watch Items

#### 3. Flood Risk AI — High-Resolution Probabilistic Modelling
**WATCH · EMERGING · TRL 6 · 70% confidence**

Next-generation flood risk models are combining LiDAR elevation data, hydrological models, and climate projections to produce property-level probabilistic flood risk scores. These are replacing FEMA flood zone maps as the primary underwriting input for flood insurance.

*Identified by: Terra agent*

---

#### 4. ESG Underwriting — Carbon Transition Risk Scoring
**WATCH · NEW · TRL 4 · 58% confidence**

Commercial insurers are beginning to incorporate carbon transition risk scores into commercial property and D&O underwriting. The challenge: no standardized methodology for translating carbon exposure into insurance risk metrics.

*Identified by: Terra agent*

---

## Key Concepts for Builders

**Parametric Insurance:** Pays out based on a measurable trigger (e.g., wind speed > 120mph, rainfall > 200mm) rather than assessed loss. Eliminates claims adjustment, enables instant settlement. Key challenge: basis risk (trigger fires but insured has no loss, or vice versa).

**Catastrophe (CAT) Modelling:** Probabilistic models estimating insured losses from natural disasters. Components: hazard model (event frequency/severity), vulnerability model (damage given hazard), exposure model (insured values at risk). AI is improving all three components.

**Satellite Data Sources for Insurance:**

| Source | Resolution | Revisit | Cost | Best for |
|--------|-----------|---------|------|---------|
| Planet Labs | 3m | Daily | Paid | Change detection, agriculture |
| Maxar | 30cm | On-demand | Paid | Post-event damage assessment |
| Sentinel-2 (ESA) | 10m | 5 days | Free | Agriculture, flood extent |
| NASA FIRMS | 375m | Near-real-time | Free | Wildfire detection |

*Auto-generated every Monday. Full intelligence: https://ynot-now.vercel.app/api/context-hub*
