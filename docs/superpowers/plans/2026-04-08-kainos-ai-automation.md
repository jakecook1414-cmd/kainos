# Kainos AI & automation operating model — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Operationalize the approved design spec (`docs/superpowers/specs/2026-04-08-kainos-ai-automation-design.md`): Notion as claims source of truth, growth instrumentation (GA4 + UTMs + optional per-embed labels), Klaviyo→Notion automation, and a documented pre-publish checklist—without scope creep into manufacturer ops.

**Architecture:** Mostly **human + SaaS consoles** (Notion, GA4, Klaviyo, Zapier) plus **small repo docs** and a **minimal `main.js` + HTML data-attribute** change so `generate_lead` can distinguish signup placements on `index.html`. No new build tooling or test framework (static site).

**Tech stack:** Static HTML/JS (`main.js`), Vercel, GA4 (`gtag`), Klaviyo embed, Zapier, Notion.

**Spec reference:** `docs/superpowers/specs/2026-04-08-kainos-ai-automation-design.md`

---

## File map (repo)

| File | Responsibility |
|------|----------------|
| `docs/marketing-utm-convention.md` | **Create** — canonical UTM naming for links and Klaviyo |
| `docs/PRE-PUBLISH-CHECKLIST.md` | **Create** — copy of spec §6 for every publish |
| `docs/superpowers/specs/2026-04-08-kainos-ai-automation-design.md` | **Optional** — bump status line to “Implementation in progress” when work starts |
| `PROJECT_CONTEXT.md` | **Modify** — one short “Operating model” pointer to `docs/` |
| `index.html` | **Modify** — `data-waitlist-placement` on each `.klaviyo-form-V8hLfp` wrapper |
| `main.js` | **Modify** — `generate_lead` uses placement for `event_label` when observer fires |

**Out of repo:** Notion page/database, GA4 Admin, Klaviyo form fields, Zap (already partially configured).

---

### Task 1: Notion — approved claims artifact

**Files:** None in repo (Notion only).

- [ ] **Step 1: Create the artifact**

In Notion (e.g. under **Kainos Bio Labs — Command Center**), create a page titled **Approved consumer claims — Kainos Deep** (or a small database with columns: `Claim`, `Status`, `Notes`).

- [ ] **Step 2: Seed required rows**

Add **approved** rows that **exactly mirror** current material facts on the live label/site for: serving size (12g scoop), servings (30), each active dose, other ingredients list, third-party tested + COA language, melatonin 0.5mg framing, and any hero/tagline lines you treat as binding.

- [ ] **Step 3: Add draft rows**

Park experimental copy under `draft` only—do not use in Klaviyo or ads until moved to `approved`.

**Verify:** Page is shared with anyone who publishes marketing; URL is copied into `PROJECT_CONTEXT.md` in Task 7.

---

### Task 2: GA4 — conversion + DebugView

**Files:** None in repo.

- [ ] **Step 1: Mark `generate_lead` as a conversion**

In GA4: **Admin → Events →** find `generate_lead` → toggle **Mark as conversion** (create if it has not appeared yet—submit one test lead after Task 6).

- [ ] **Step 2: DebugView smoke test**

Open **Admin → DebugView**; in a separate browser with GA Debugger or `debug_mode`, load `kainosbiolabs.com`, complete a test signup (staging or real list per your Klaviyo setup).

**Expected:** One `generate_lead` per successful submit within ~2s; no burst of 5+ duplicate events for a single submit. If duplicates appear, narrow `klaviyoForms` listener types in `main.js` (separate change—document in commit message).

---

### Task 3: UTM convention doc (repo)

**Files:**
- Create: `docs/marketing-utm-convention.md`

- [ ] **Step 1: Add the file with this content**

```markdown
# Kainos — UTM convention (pre-launch)

Use on every external link to the site (social bio, emails, ads, partners).

## Parameters

| Parameter | Required | Examples |
|-----------|----------|----------|
| `utm_source` | Yes | `instagram`, `tiktok`, `newsletter`, `partner_name` |
| `utm_medium` | Yes | `social`, `email`, `referral`, `cpc` |
| `utm_campaign` | Yes | `waitlist_2026_q2`, `founding_launch` |

## Rules

- Lowercase, underscore-separated tokens; no spaces.
- One campaign name per initiative; reuse across channels only when the initiative is identical.
- Do not reuse `utm_campaign` for unrelated creatives—creates dirty attribution.

## Klaviyo

- Pass UTMs into profile properties via form hidden fields or Klaviyo JS where supported so Zapier→Notion rows stay attributable.

## Full URL example

`https://kainosbiolabs.com/?utm_source=instagram&utm_medium=social&utm_campaign=waitlist_2026_q2`
```

- [ ] **Step 2: Commit**

```bash
cd /path/to/kainos
git add docs/marketing-utm-convention.md
git commit -m "docs: add marketing UTM convention for attribution"
```

---

### Task 4: Pre-publish checklist (repo)

**Files:**
- Create: `docs/PRE-PUBLISH-CHECKLIST.md`

- [ ] **Step 1: Add the file**

```markdown
# Pre-publish checklist — customer-facing copy

Use before publishing or scheduling any change to **hero, ingredients, supplement facts, FAQ, comparison table, or pricing** (site, Klaviyo, or ads).

1. **Label match** — Wording matches the current **official label** (or pending label clearly marked “not live” and not deployed).
2. **Notion match** — Claims appear as **approved** in **Approved consumer claims — Kainos Deep** in Notion.
3. **Analytics** — For A/B tests or new landing paths, **UTMs** and/or distinct **`event_label`** on `generate_lead` are set for measurement.

Signer: _________________  Date: _________
```

- [ ] **Step 2: Commit**

```bash
git add docs/PRE-PUBLISH-CHECKLIST.md
git commit -m "docs: add pre-publish checklist for claims and analytics"
```

---

### Task 5: Klaviyo — UTM capture

**Files:** None (Klaviyo UI).

- [ ] **Step 1:** Open the embedded form tied to class `klaviyo-form-V8hLfp` (or the list used for waitlist).

- [ ] **Step 2:** Add hidden fields or use Klaviyo’s supported method to persist `$source` / UTM properties (`utm_source`, `utm_medium`, `utm_campaign`) onto the profile on submit. Align field names with Zapier→Notion column mapping.

- [ ] **Step 3:** Submit a test signup from a URL with query string from `docs/marketing-utm-convention.md`.

**Verify:** Profile in Klaviyo shows UTM properties; Zapier test row (Task 6) shows them if mapped.

---

### Task 6: Zapier — Klaviyo → Notion

**Files:** None (Zapier UI).

- [ ] **Step 1:** Confirm Zap is **On**; trigger is **New Subscriber** (or equivalent) on the **waitlist** list only.

- [ ] **Step 2:** Map Notion properties: email → title or Email property; time → Signed up; Klaviyo UTM properties → `UTM source` / `UTM medium` / `UTM campaign` columns if present.

- [ ] **Step 3:** Run **Test**; confirm one row in **Kainos — Waitlist signups** (or your chosen database).

**Expected:** New row within 1–2 minutes of test submit.

---

### Task 7: `PROJECT_CONTEXT.md` — pointer to operating docs

**Files:**
- Modify: `PROJECT_CONTEXT.md`

- [ ] **Step 1: Append a section** (after existing sections, before end of file)

```markdown
## Operating model (growth + claims)

- **Approved claims (Notion):** [paste URL to Approved consumer claims — Kainos Deep]
- **UTM rules:** `docs/marketing-utm-convention.md`
- **Before publish:** `docs/PRE-PUBLISH-CHECKLIST.md`
- **Design spec:** `docs/superpowers/specs/2026-04-08-kainos-ai-automation-design.md`
```

Replace the bracketed Notion URL with the real link from Task 1.

- [ ] **Step 2: Commit**

```bash
git add PROJECT_CONTEXT.md
git commit -m "docs: link operating model and Notion claims from PROJECT_CONTEXT"
```

---

### Task 8: Per-embed `event_label` (hero vs footer on home)

**Files:**
- Modify: `index.html` (two Klaviyo wrappers)
- Modify: `main.js` (`initKlaviyoGenerateLeadTracking`)

- [ ] **Step 1: HTML — add data attributes**

In `index.html`, on the **first** `.klaviyo-form-V8hLfp` (inside `#waitlist`), open the div tag and add:

`data-waitlist-placement="hero"`

On the **second** `.klaviyo-form-V8hLfp` (inside `#cta-waitlist`), add:

`data-waitlist-placement="footer"`

Example (hero):

```html
<div class="klaviyo-form-V8hLfp" data-waitlist-placement="hero"><noscript>...</noscript></div>
```

- [ ] **Step 2: JS — replace `initKlaviyoGenerateLeadTracking` body** with logic that passes placement into the event.

Replace the function `initKlaviyoGenerateLeadTracking` (from `function initKlaviyoGenerateLeadTracking()` through its closing `}` before `initKlaviyoGenerateLeadTracking();`) with:

```javascript
    function initKlaviyoGenerateLeadTracking() {
      var lastFire = 0;
      function fireGenerateLead(placement) {
        var now = Date.now();
        if (now - lastFire < 1200) return;
        lastFire = now;
        if (typeof window.gtag !== 'function') return;
        var label =
          placement === 'hero'
            ? 'Klaviyo Signup — Hero'
            : placement === 'footer'
              ? 'Klaviyo Signup — Footer'
              : 'Klaviyo Signup';
        window.gtag('event', 'generate_lead', {
          event_category: 'Waitlist',
          event_label: label,
          value: 1,
        });
      }

      document.addEventListener('klaviyoForms', function (e) {
        if (!e.detail) return;
        var type = String(e.detail.type || '');
        if (
          type === 'submit' ||
          type === 'subscribe' ||
          type === 'completed' ||
          type === 'success' ||
          type === 'redirectedToUrl' ||
          (e.detail.metaData &&
            String(e.detail.metaData.stepName || '').toLowerCase().indexOf('success') !== -1)
        ) {
          fireGenerateLead(null);
        }
      });

      function subtreeLooksLikeSuccess(root) {
        if (!root || !root.querySelectorAll) return false;
        var nodes = root.querySelectorAll(
          '[class*="success"], [class*="thank"], [class*="subscribed"], [data-testid*="success"], [aria-live="polite"]'
        );
        var i;
        for (i = 0; i < nodes.length; i++) {
          var t = (nodes[i].textContent || '').toLowerCase();
          if (
            /thank\s*you|you.re\s*(in|subscribed|on\s*the\s*list)|successfully\s*subscribed|check\s*your\s*email|you.re\s*all\s*set/.test(
              t
            )
          ) {
            return true;
          }
        }
        return false;
      }

      document.querySelectorAll('.klaviyo-form-V8hLfp').forEach(function (container) {
        var placement = container.getAttribute('data-waitlist-placement') || '';
        var obs = new MutationObserver(function () {
          if (subtreeLooksLikeSuccess(container)) fireGenerateLead(placement);
        });
        obs.observe(container, { childList: true, subtree: true, characterData: true });
      });
    }
```

**Note:** `klaviyoForms` path still uses `fireGenerateLead(null)` → label **Klaviyo Signup** because Klaviyo may not expose which embed fired. **MutationObserver** path gets correct **Hero** vs **Footer** on `index.html`. If Klaviyo later exposes form ID in `e.detail`, extend the listener to map ID → placement.

- [ ] **Step 3: Manual browser test**

1. Open `index.html` locally or production home.
2. Open DevTools → Network, filter `collect` or use GA4 DebugView.
3. Submit from **hero** form → expect `event_label` **Klaviyo Signup — Hero** (or generic if only `klaviyoForms` fires—note actual behavior in commit message if different).
4. Submit from **footer** form → expect **Klaviyo Signup — Footer** when observer detects success.

- [ ] **Step 4: Commit**

```bash
git add index.html main.js
git commit -m "feat(analytics): distinguish waitlist generate_lead by placement on home"
```

---

## Self-review (plan vs spec)

| Spec section | Covered by |
|--------------|------------|
| §4.1 GA4 `generate_lead` | Task 2 |
| §4.1 UTMs | Tasks 3, 5 |
| §4.1 Multiple embeds / `event_label` | Task 8 |
| §4.2 Klaviyo → Notion + weekly review | Task 6 (automation); weekly review = calendar habit—optional Notion recurring task, not coded |
| §4.3 AI growth inputs | Habit + Notion page—no code; Cursor rules already exist |
| §5.1 Approved claims Notion | Task 1 |
| §5.2–5.3 Guardrails / COA | Enforced by checklist + existing `.cursor/rules`; Task 4 |
| §6 Pre-publish checklist | Task 4 |
| §7 Success criteria | Validated by Tasks 2, 5, 6, 8 over 90 days |
| §8 Deferrals | No tasks for manufacturer BI/Shopify |

**Placeholder scan:** None.

---

## Execution handoff

**Plan complete and saved to** `docs/superpowers/plans/2026-04-08-kainos-ai-automation.md`.

**Two execution options:**

1. **Subagent-driven (recommended)** — Fresh subagent per task, review between tasks, fast iteration. **Required sub-skill:** superpowers:subagent-driven-development.

2. **Inline execution** — Run tasks in this session with checkpoints. **Required sub-skill:** superpowers:executing-plans.

**Which approach do you want?**
