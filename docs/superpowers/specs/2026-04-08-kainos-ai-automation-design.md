# Kainos — AI & automation operating model (design spec)

**Date:** 2026-04-08  
**Status:** Approved by stakeholder (chat)  
**Scope:** Pre-launch phase (~90 days); growth (A) + risk/quality (C). Manufacturing/copacker ops (B) out of scope until vendor-led execution.

---

## 1. Purpose

Define how Kainos uses **automations** and **AI assistants** so that:

- **Growth:** Waitlist and attribution improve with measurable, repeatable inputs.
- **Risk/quality:** Customer-facing claims stay aligned with the **label** and **structure/function** norms; nothing ships silently out of sync.

This document is the **system design** for behavior and tooling—not a legal opinion. Final claims remain subject to counsel and the official product label.

---

## 2. Goals and non-goals

### Goals

- Increase **qualified waitlist signups** with **channel-level attribution** (UTMs, GA4, Klaviyo).
- Ensure **material facts** on site, email, and future ads **match** the approved label and a single **approved-claims** reference in Notion.
- Use AI to **draft** and **analyze** under explicit constraints; humans **approve** customer-facing output.

### Non-goals (this phase)

- Automating **copacker batch operations**, **WIP tracking**, or **inventory** (manufacturer-owned when relevant).
- Replacing **legal/regulatory** review with AI.
- Building a custom backend or CMS unless a clear need emerges after this model is exercised.

---

## 3. Architecture (conceptual)

| Layer | Role | Primary tools |
|-------|------|----------------|
| **Growth nervous system** | Capture leads, measure conversion, attribute sources | Klaviyo, GA4, Vercel static site, Zapier |
| **System of record (claims)** | Approved consumer-facing statements and doses | Notion (page or lightweight database) |
| **Automation pipes** | Move data; no “smart” claims logic | Zapier (e.g. Klaviyo → Notion signup row) |
| **AI layer** | Draft copy, summarize research, prep checklists | Cursor + project rules; optional Notion skills via MCP |
| **Human gates** | Approve claims, publish site/email | Founder / designated reviewer; counsel as needed |

**Interface rule:** Any **new** customer-facing claim must exist in **Notion approved claims** (or on the master label document mirrored there) **before** it appears on site, in Klaviyo, or in paid creative.

---

## 4. Growth layer (A)

### 4.1 Instrumentation

- **GA4:** Treat **`generate_lead`** (Waitlist / Klaviyo Signup) as the primary conversion; verify it is marked as a **conversion** in GA4 and spot-check in **DebugView** after deploys.
- **UTMs:** Use a **consistent naming convention** on every external link (e.g. `utm_source`, `utm_medium`, `utm_campaign`); ensure Klaviyo captures them on profiles where possible.
- **Multiple embeds:** If more than one signup surface is active on a page, distinguish them in analytics (e.g. separate **`event_label`** values in `gtag`) so tests are interpretable.

### 4.2 Automations

- **Klaviyo → Notion:** One row per new waitlist subscriber (or per list join), with timestamp and UTM fields when available.
- **Weekly review (lightweight):** A recurring calendar block or Notion task to review **signups by source** and **GA4 landing engagement**; no requirement for a fully automated dashboard in this phase.

### 4.3 AI for growth

- **Inputs to the model:** Persona, offer, channel (email vs landing vs ad), and a pointer to **approved claims** in Notion.
- **Output:** Drafts only; **human publishes** after checklist (Section 6).

---

## 5. Risk and quality layer (C)

### 5.1 Approved claims source

- Maintain **one** Notion artifact: **“Approved consumer claims — Kainos Deep”** (title may vary; function must not).
- Each line or block should be **short**, **customer-facing**, and tagged with **status**: `draft` | `approved` | `retired`.
- **Material facts** (serving size, doses, other ingredients, COA/customer-facing testing language) must match the **official label**; the Notion doc **references** or **quotes** the label—it does not replace it.

### 5.2 AI and copy guardrails

- **No disease claims**; **no** implied FDA approval of the product.
- Avoid **unsubstantiated superlatives** (“best,” “most clinically studied in the world”) unless tied to an **approved** citation line in Notion.
- Prefer **structure/function** phrasing consistent with site rules in `.cursor/rules/kainos-fda-brand.mdc`.
- Cursor/project rules continue to apply to code and markdown in repo; marketing drafts follow the same substance whether written in Notion or in the IDE.

### 5.3 COA and testing language

- Customer-facing promise: **third-party tested; COA on request** (as on site). Operational handling of COA files may stay manual until volume warrants a Notion attachment workflow—**out of scope** for mandatory automation in this spec.

---

## 6. Pre-publish checklist (human)

Before publishing or scheduling **any** change to hero, ingredients, supplement facts, FAQ, comparison table, or pricing copy:

1. **Label match:** Wording matches current **label** (or pending label explicitly marked “not live”).
2. **Notion match:** Claims appear under **approved** in the approved-claims artifact.
3. **Analytics:** If the change is an **A/B** or new landing path, UTMs and/or `event_label` are set for measurement.

---

## 7. Success criteria (90 days)

### Growth

- **Attribution:** For major channels in use (e.g. organic social, email, referrals), **UTM coverage** is high enough to rank sources by signup volume.
- **Measurement:** `generate_lead` is **trusted** (no systematic double-fires; spot-checks after Klaviyo changes).

### Quality

- **No silent drift** on material facts between **label**, **site**, and **primary email sequences** after checklist adoption.
- **Claim incidents:** Zero customer-facing “oops” releases that require emergency copy rollback for factual product data (tone tweaks excluded).

---

## 8. Explicit deferrals

- **Manufacturing ops automation** until the manufacturer’s process is the driver.
- **Shopify/theme** claim sync until storefront work resumes (theme folder may lag; do not treat as live source of truth).
- **Heavy BI** (Looker, etc.) until traffic and spend justify it.

---

## 9. Revision history

| Version | Date | Note |
|---------|------|------|
| 1.0 | 2026-04-08 | Initial design; stakeholder approval in chat |
