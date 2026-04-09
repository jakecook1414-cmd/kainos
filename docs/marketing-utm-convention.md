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
