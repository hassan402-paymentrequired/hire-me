# Proxideck — V1 Scope (What Ships Now vs Later)

**Version:** Draft 1  
**Date:** May 2026  
**Purpose:** Prevent scope creep and align demos with what v1 actually offers.

---

## V1 in one sentence

**Verified service professionals get booked and paid through marketplace profiles and appointment scheduling — with escrow, completion confirmation, and admin-backed dispute resolution.**

V1 is **not** a general “post any job, get quotes” marketplace (Jiji-style). That is **v2**.

---

## In scope for v1

| Surface | User-facing? | Notes |
|---------|--------------|--------|
| **Marketplace discovery** | Yes | Browse, filter, provider profiles |
| **Appointment booking** | Yes | Services, slots, wallet, escrow |
| **On-site via booking** | Yes (once P0.4/P0.5 ship) | Client address on appointment; delivery mode — not job board |
| **In-shop booking** | Yes | Salon, barber, spa — primary fit today |
| **Wallet + Paystack top-up** | Yes | Escrow hold → confirm → release |
| **Reviews + verification** | Yes | Trust signals on profiles |
| **Provider dashboard** | Yes | Calendar, services, hours, analytics, wallet |
| **Admin moderation + disputes** | Yes | Reports, support, wallet adjustments ([SOP](./DISPUTE_RESOLUTION_SOP.md)) |
| **Become a provider onboarding** | Yes | Business profile → services → hours |

---

## Built in code but **not** offered in v1 (intentionally deferred)

These exist to avoid rework later; they are **not** part of the v1 promise to users or investors.

| Feature | Code status | UI status | Target |
|---------|---------------|-----------|--------|
| **Post a Job / job board / bids** | Routes + pages + partial backend | May be reachable; **not marketed or completed for users** | **v2** — quote-based / handyman-style hire |
| **Embeddable booking widget** | API + embed + provider integration page | Provider sidebar shows **locked** (`isLocked: true`) | **v2** — distribution off marketplace |
| **WhatsApp channel** | Not built | — | **v2** |
| **In-app messaging** | Not built | — | **v2+** |
| **Guest checkout (no account)** | Not built | — | Evaluate v2 |
| **Quote-based services (`pricing_type: quote`)** | Not built | — | **v2** (often pairs with job board) |

**Product rule:** Do not demo or pitch v2 features as live. Say *“on the roadmap”* if asked.

---

## How to answer the CTO / “hire a handyman” question in v1

**Do not say:** “Yes, post a job and hire any handyman on Proxideck today.”

**Do say:**

> “You book a **defined service** at a time — at their place or yours — with payment held until the job is confirmed complete. Salons, mobile stylists, and handymen with listed services all use the same flow. **Open-ended ‘post a job, get quotes’** is v2; we built the code but haven’t turned it on yet.”

---

## v1 category focus (GTM vs product capability)

**Important distinction:**

| | Meaning |
|---|--------|
| **Go-to-market priority** | Who you *recruit first* (salon, spa, barber — easier density, clearer slots) |
| **Product capability** | Who the platform *supports* once delivery rules are correct |

**You can onboard a handyman in v1** if they list bookable services and offer home service. GTM focus on salons does **not** mean handymen are excluded.

**Home service is not “handyman-only.”** Many salons, spas, and barbers also go to the client. The same delivery-mode work (P0.4/P0.5) helps **everyone** who travels to the customer — beauty, wellness, trades, cleaning.

### Two ways to “hire” on Proxideck

| Model | Example | v1? | Needs |
|-------|---------|-----|--------|
| **Book a defined service** | “Home haircut — ₦8,000, 1hr” or “AC inspection — ₦5,000” | **Yes** | Delivery mode, client address, slots, escrow |
| **Describe a problem, get quotes** | “My pipe is leaking, not sure of cost” | **v2** | Job board + bids (deferred) |

Rewriting **business rules** (delivery mode, required address, copy, provider onboarding defaults) lets v1 serve **both** in-shop and on-site pros — including handymen with fixed-price services. You do **not** need the job board for every handyman hire.

### GTM recommendation (marketing order, not a hard limit)

**Recruit first:** salon, barber, spa, nails — fast proof of trust loop + repeat bookings.

**Also welcome in v1 when opportunity arises:** cleaners, tutors, mobile beauty, handymen/plumbers who sell **named services at a price** (not quote-only).

**Save for v2 pitch:** providers who only work quote-first with no catalog (“tell me your problem, I’ll bid”).

---

## v1 success = trust loop, not feature count

1. Provider onboarded + verified  
2. Client books with escrow  
3. Service happens (location clear)  
4. Completion confirmed → provider paid  
5. Review left; dispute path exists if needed  

---

## Related docs

- [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) — strategy  
- [FIX_PLAN.md](./FIX_PLAN.md) — v1 vs v2 item tags  
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) — what to show in demos  
