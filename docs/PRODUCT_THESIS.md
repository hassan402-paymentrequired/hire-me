# Proxideck — Product Thesis

**Version:** Draft 1  
**Date:** May 2026  
**Audience:** Leadership, investors, internal alignment  

**Related docs:** [README](./README.md) · [FIX_PLAN](./FIX_PLAN.md) · [CTO_FEEDBACK](./CTO_FEEDBACK.md) · [DEMO_SCRIPT](./DEMO_SCRIPT.md)

---

## One sentence

**Proxideck helps service professionals in Nigeria get booked and paid online — with payment protection, verification, and a clear completion flow — while giving clients a trusted alternative to unprotected Jiji/WhatsApp hires.**

---

## The problem we solve

In Nigeria, most local service hires still happen like this:

1. Find someone on Jiji, Instagram, or referral  
2. Negotiate on WhatsApp or phone  
3. Pay cash or transfer with no recourse if the job goes wrong  
4. No structured proof of completion, reviews, or dispute handling  

This works for simple searches but fails on **trust**, **payment safety**, and **repeatability** — for both clients and professionals who want serious business, not endless chat threads.

---

## Who we serve (personas)

| Persona | Needs | Proxideck value |
|---------|--------|-----------------|
| **Client** (homeowner, busy professional) | Hire trusted local help without payment risk | Verified pros, escrow, reviews, dispute path |
| **Service professional** (barber, plumber, cleaner, tutor) | More bookings, less admin, reliable payout | Profile, scheduling, widget, wallet, analytics |
| **Platform admin / ops** | Verification, moderation, financial oversight | Admin tools, reports, support tickets |

One account can be **both client and provider** (see `ROLE_SYSTEM_UPDATE.md`).

---

## What Proxideck is (and is not)

### We are

A **trust + booking + payments platform** for service professionals:

- Public profile and discovery (marketplace)
- Online scheduling (services, slots, team members)
- Wallet + escrow (Paystack) — pay upfront, release on confirmed completion
- Provider operations (calendar, analytics, widget embed, verification)
- Dispute-aware cancellation and refund rules

### We are not

- A Jiji clone optimized only for “find any plumber fast”
- A pure appointment app for in-shop services only (salon/barber)
- “Just a website” — channels beyond web (especially WhatsApp) matter in our market

### Non-goals (v1)

- Beating Jiji on raw search volume or listing count nationwide  
- Native mobile apps before web + WhatsApp channels prove retention  
- Full two-way WhatsApp bot before notification/deep-link Phase A  
- Commission-free marketplace with no monetization story  
- One generic “appointment” UX for every category without delivery-mode differences  

---

## Competitive context (short)

| Alternative | Strength | Our angle |
|-------------|----------|-----------|
| **Jiji / classifieds** | Fast find, familiar, free | Protected payment + verification + completion loop |
| **WhatsApp-only hire** | Zero friction, universal | Structured record, escrow, recourse, reputation |
| **Calendly / Fresha-style tools** | Great scheduling | Scheduling + **local marketplace + Paystack escrow** for Nigeria |
| **Instagram DMs** | Discovery for creatives | Same as WhatsApp row — we add trust layer |

---

## Strategic choice: distribution-first, discovery-second

| Priority | Job | Why |
|----------|-----|-----|
| **Primary** | **Distribution for professionals** | Pros need bookings, payments, and credibility tools. We monetize via commission (10%) or subscription. |
| **Secondary** | **Discovery for clients** | Marketplace brings demand, but supply density is a long game. Widget + direct links let pros bring their own customers. |

**We do not win by out-listing Jiji on day one.** We win when a professional (or their client) chooses Proxideck because **money and completion are handled responsibly**.

---

## Two service models (both supported, different UX)

Not all local services work the same way. Proxideck must make the model obvious:

| Model | Examples | Who travels | Booking shape |
|-------|----------|-------------|---------------|
| **In-shop / visit provider** | Salon, barber, spa, some clinics | Client → provider | Fixed services, time slots, provider address prominent |
| **On-site / provider comes to client** | Plumber, handyman, cleaner, electrician | Provider → client | Client address required, flexible or quote-based jobs |

**Today:** the product is optimized for in-shop appointments. On-site hiring is under-expressed in UI despite partial backend support (`offers_home_service`, `service_address_*` on appointments).

**Commitment:** on-site flows will be first-class, not an afterthought.

### Known gaps today (honest)

| Gap | Impact |
|-----|--------|
| UI defaults to in-shop / “Book appointment” | On-site booking via appointments feels wrong until delivery mode ships |
| Provider business address hero on profile/booking | Implies client travels to vendor |
| `offers_home_service` not wired in booking UX | Home service setting has no effect |
| Job board + widget built but **not v1** | Do not pitch as live; completes in v2 |
| Wallet top-up before book | Extra friction vs Jiji (tradeoff under-explained) |
| Landing page placeholder stats | Over-promises supply if marketplace sparse |
| WhatsApp not integrated | CTO channel concern — planned v2 |

See [FIX_PLAN.md](./FIX_PLAN.md) for v1 remediation and [V1_SCOPE.md](./V1_SCOPE.md) for release boundaries.

---

## Why not Jiji + WhatsApp?

| Jiji + WhatsApp | Proxideck |
|-----------------|-----------|
| Free, fast, familiar | Structured hire with rules |
| No payment protection | Escrow until confirmed completion |
| No verified identity standard | Provider verification pipeline |
| No dispute process | Cancellations, refunds, admin moderation |
| Chat-only coordination | Booking record, notifications, reviews |

**Pitch to clients:** “Same local pros — but you’re not gambling your money on a stranger.”  
**Pitch to providers:** “Look professional, get paid reliably, reduce no-shows and payment disputes.”

---

## The trust loop (our core product — not the calendar)

This is what demos must lead with:

1. Client selects service / posts need  
2. Client pays (wallet top-up → escrow hold)  
3. Service is delivered (at client or provider location — clearly labeled)  
4. Both parties confirm completion (or dispute)  
5. Funds release to provider (or refund per policy)  
6. Client leaves review; reputation accumulates  

Technology enables this loop. **The loop is the product.**

Operational detail for disputes and refunds: [DISPUTE_RESOLUTION_SOP.md](./DISPUTE_RESOLUTION_SOP.md).

---

## Channels (web is v1, not the whole market)

| Channel | Role | Status |
|---------|------|--------|
| Web marketplace + booking | Core v1 | Live |
| Embeddable widget (provider’s site) | Distribution | **v2** — built, locked in provider UI |
| Email + web push notifications | Engagement | Live |
| WhatsApp (status, booking links, reminders) | Nigeria reality | Planned — high priority |
| Native mobile app | Convenience | Future |

We will not “lock ourselves into the website” as the only touchpoint.

---

## Business model

- **Providers:** 10% commission on completed bookings *or* subscription plans (₦5,000/mo, ₦13,500/quarter) for reduced/zero commission  
- **Clients:** Free to browse; pay service price + wallet top-up via Paystack  
- **Platform:** Revenue from commission/subscriptions; escrow float is operational, not profit center  

---

## Geography and categories

- **Geography:** Nigeria-first (Paystack, Africa/Lagos, local service categories)  
- **Categories:** Home services, beauty, wellness, events, tutoring, automotive, professional services — with **category-appropriate UX**, not one generic “appointment” flow for everything  

---

## Success metrics (what “working” looks like)

**Supply side**

- Providers complete onboarding + verification  
- Providers receive bookings via marketplace and/or widget  
- Provider wallet withdrawals succeed  

**Demand side**

- Clients complete booking with escrow  
- Completion confirmation rate (both sides)  
- Reviews after completed jobs  

**Trust**

- Dispute/refund resolution time  
- Repeat bookings per client  

---

## What we owe the next demo

1. State clearly: **distribution-first**, trust loop as hero  
2. Show **two flows**: in-shop book vs on-site request (even if second is “in progress”)  
3. Walk through **escrow → confirm → pay → review**, not just marketplace scroll  
4. Acknowledge **WhatsApp** as channel v2 — not ignore it  

---

## Summary

Proxideck is not “another place to find a plumber.” It is **infrastructure for hiring local service professionals with protected payment and accountable completion** — starting in Nigeria, starting with professionals who want real bookings, and expanding channels (web, widget, WhatsApp) to meet the market where it already is.

**Technology is the enabler. Trust, channels, and resolution are the product.**