---
created: 2026-11-11T11:07:26.982Z
title: Measure Resume AI Call Savings
area: general
files:
  - backend/src/modules/resume/agent/improvement.agent.ts
  - backend/src/infrastructure/ai.ts
---

## Problem

The resume improvement flow uses multiple Gemini calls for analysis, rewriting, and validation. Combining the analysis calls should reduce latency and cost, but the savings have not been benchmarked with representative requests.

## Solution

Measure request-level model call counts and latency after the analysis consolidation; use the results to decide whether further optimization is warranted.
