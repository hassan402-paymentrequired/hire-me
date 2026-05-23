# Proxideck — Standard Demo Script

**Duration:** ~5 minutes  
**Audience:** Leadership, investors, partners  
**Goal:** Show the **trust loop** and **distribution** story — not “another listing site.”

**Do not open with:** marketplace scroll, fake stats, or “find providers near you” unless explicitly demoing discovery as a secondary channel.

---

## Before the demo

- [ ] Use a **verified provider** with realistic services
- [ ] For on-site demo: provider has `offers_home_service` / delivery mode = “We come to you” (once P0.4/P0.5 shipped); until then, acknowledge gap verbally
- [ ] Client account has wallet balance **or** be ready to show top-up (note friction — see P1.9)
- [ ] One completed booking in history to show confirm → review (optional)

---

## Script

### 1. Problem (30 sec)

> “In Nigeria most hires still go: Jiji or referral → WhatsApp → cash. If the job goes wrong, there’s no protection. Proxideck is **not** trying to replace Jiji for casual search — we’re the **trust and payment layer** for hiring local professionals.”

### 2. Who we serve first (30 sec)

> “We’re **distribution-first**: we help service professionals get booked and paid online. Marketplace discovery is a bonus. Many pros bring their own clients via profile link or embeddable widget.”

Reference: [PRODUCT_THESIS.md](./PRODUCT_THESIS.md)

### 3. Provider credibility (45 sec)

- Open provider public profile
- Point out: **verification badge**, services, reviews, gallery
- If in-shop: “Client visits them here [address]”
- If on-site: “Pro comes to the client — address collected at booking” (once fixed)

**Say:** “Verification + reputation live on the platform, not only in WhatsApp chat.”

### 4. Book + pay (90 sec)

Walk through booking (or job post if demoing handyman):

1. Select service (or post job with **client address** + description)
2. **Explain escrow before paying:**
   > “Client pays upfront. Money is held securely — not released until the job is done and confirmed.”
3. Show wallet top-up if needed (acknowledge: “We’re simplifying this vs Jiji’s zero friction — tradeoff is protection.”)
4. Confirm booking created; show status (pending/confirmed)

**Key files in product:** booking summary, payment confirm dialog, client booking detail.

### 5. Service delivery + location (30 sec)

- Open provider appointment detail
- Show **service address** (client location) for on-site — not only business address
- Provider marks complete / client confirms

**Say:** “For a plumber, the pro sees where to go. For a salon, the client sees where to visit.”

### 6. Trust loop close (60 sec)

1. **Dual confirmation** → escrow releases to provider wallet
2. **Review** — builds public reputation
3. **If dispute:** client reports → admin moderation → refund path ([DISPUTE_RESOLUTION_SOP.md](./DISPUTE_RESOLUTION_SOP.md))

**Say:** “This loop is the product. The calendar and marketplace support it.”

### 7. Channels (30 sec)

> “Web and widget are live today. WhatsApp notifications and booking links are next — we’re not betting the company on website-only.”

Reference: [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Channels, [FIX_PLAN.md](./FIX_PLAN.md) P2.1

### 8. Close (15 sec)

> “Jiji helps you **find** someone. Proxideck helps you **hire** someone with protected payment and accountable completion.”

---

## If asked: “Why not Jiji?”

Use the table in [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Why not Jiji + WhatsApp.

Short version:

- Escrow until completion  
- Verified providers  
- Structured cancellation/refund  
- Reviews tied to paid jobs  
- Dispute path (admin)

---

## If asked: “Can I hire a handyman?”

**Honest answer for v1:**

> “V1 is **trusted appointment booking** for service professionals — book a defined service at a time, pay through escrow, confirm when done. For open-ended jobs like ‘fix my pipe,’ we’re building **Post a Job** in v2. Today I’ll show you booking + payment protection.”

Demo: in-shop provider **or** on-site provider with home-service booking (once P0.5/P0.4 ships). Do **not** open job board or widget unless demoing roadmap.

---

## Anti-patterns (what went wrong last demo)

| Don’t | Why |
|-------|-----|
| Start on homepage marketplace grid | Looks like Jiji; CTO asked “why not Jiji?” |
| Show only provider business address | Implies client travels to vendor |
| Say “appointment” for plumber hire | Wrong mental model |
| Skip escrow explanation | Misses “how money is made” |
| Ignore WhatsApp | Sounds web-only in Nigeria |
