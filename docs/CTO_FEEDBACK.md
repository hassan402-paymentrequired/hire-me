# CTO Feedback — Summary & Mapping

**Source:** Voice recording, AI-transcribed/summarized (May 2026)  
**Context:** Live product demo; pitch was “hire a handyman”; demo showed marketplace + appointment booking.

---

## Feedback themes (cleaned)

| # | Theme | CTO’s concern |
|---|--------|----------------|
| 1 | **Discovery vs distribution** | Is this for customers finding pros, or pros reaching customers? Pick one. |
| 2 | **Who goes where** | Addresses suggest the client visits the vendor — wrong for handyman/plumber. |
| 3 | **Appointment-only UX** | Everything reads “appointment”; doesn’t feel like general hire/work. |
| 4 | **Why not Jiji** | Can search Jiji for a plumber and hire via phone/WhatsApp — what’s the extra value? |
| 5 | **Channels** | Don’t lock into website only; WhatsApp (and similar) may matter as much as web/app. |
| 6 | **Post-service feedback loop** | After delivery: confirm, review, clear path — immediate signal for how money is made. |
| 7 | **Responsible resolution** | When things go wrong: who decides refund vs payout? Process must exist. |
| 8 | **Technology vs product** | “Technology is the smallest part; the real product is trust, channels, operations.” |

---

## Mapping to docs and fixes

| Theme | Addressed in | Fix plan IDs |
|-------|----------------|--------------|
| Discovery vs distribution | [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Strategic choice | P0.1 |
| Trust loop / how money is made | [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Trust loop; [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | P0.2, P1.4, P1.5 |
| Who goes where / addresses | [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Two service models | P0.4, P0.5, P0.6, P0.7 |
| Appointment vs hire generality | [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Two service models | P1.1, P1.2, P1.3, P2.3 |
| Why not Jiji | [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Why not Jiji | P1.4, P1.9, P2.5, P2.6 |
| WhatsApp / multi-channel | [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) § Channels | P2.1, P2.2 |
| Feedback loop after service | [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) steps 5–6 | P1.5, P1.10 |
| Dispute resolution | [DISPUTE_RESOLUTION_SOP.md](./DISPUTE_RESOLUTION_SOP.md) | P1.6 |
| Brand / messaging clarity | [FIX_PLAN.md](./FIX_PLAN.md) P0.3, P0.8 | P0.3, P0.8 |
| Wallet friction vs Jiji | [FIX_PLAN.md](./FIX_PLAN.md) P1.9 | P1.9 |
| Misleading marketplace social proof | [FIX_PLAN.md](./FIX_PLAN.md) P2.6 | P2.6 |
| Provider sees wrong location on jobs | [FIX_PLAN.md](./FIX_PLAN.md) P1.10 | P1.10 |

---

## What we got right (already built)

The demo underplayed features the CTO was asking for:

- **Escrow + wallet** — upfront hold, release on completion (`WALLET_ESCROW_IMPLEMENTATION.md`)
- **Dual confirmation** — client + provider before payout
- **Cancellation / penalty rules** — early/late cancel, provider cancel → refund
- **Reviews + verification** — admin verification pipeline, post-job reviews
- **Job posting + bids** — closer to handyman hire (incomplete: bid → hire conversion)
- **Service address on appointments** — backend + provider appointment detail (client-side UX weak)
- **Embeddable widget** — distribution channel off marketplace

**Lesson:** Next demo leads with the trust loop, not directory browsing.

---

## Open leadership decisions

Document answers in [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) when decided:

1. Launch geography (e.g. Lagos-only until supply density)?
2. WhatsApp Phase A vendor (Meta Business API vs link-only notifications)?
3. Guest checkout vs mandatory account + wallet for v1?
4. Job board vs appointment booking — which is default for Home Services categories?
