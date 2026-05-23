# Proxideck — Product Documentation

Internal product docs aligned after CTO feedback (May 2026). Use these before demos, roadmap planning, or onboarding new contributors.

| Document | Purpose |
|----------|---------|
| [PRODUCT_THESIS.md](./PRODUCT_THESIS.md) | What we are, who we serve, strategic choices, trust loop, business model |
| [FIX_PLAN.md](./FIX_PLAN.md) | Prioritized fixes (P0–P3) mapped to codebase and acceptance criteria |
| [CTO_FEEDBACK.md](./CTO_FEEDBACK.md) | Original feedback themes → doc sections and fix IDs |
| [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) | Standard 5-minute demo flow (trust loop first, not marketplace scroll) |
| [DISPUTE_RESOLUTION_SOP.md](./DISPUTE_RESOLUTION_SOP.md) | Admin/support playbook for refunds, disputes, and escrow decisions |
| [V1_SCOPE.md](./V1_SCOPE.md) | What ships in v1 vs deferred (job board, widget, WhatsApp) |

## Quick answers (for alignment)

**What is Proxideck?** Trust + booking + payments for Nigerian service professionals — not a Jiji clone.

**Primary bet:** Distribution for professionals (bookings, escrow, widget). Marketplace discovery is secondary.

**Core product:** Escrow → service delivery → dual confirmation → payout → review/dispute. The calendar is supporting infrastructure.

**Known gap:** UI is appointment/salon-shaped; on-site via booking + home address is partial until P0.4/P0.5. Job board and widget are **v2** ([V1_SCOPE.md](./V1_SCOPE.md)).

## Related repo docs (implementation detail)

- `Readme.md` — stack and route inventory
- `WALLET_ESCROW_IMPLEMENTATION.md` — payment/escrow mechanics
- `WIDGET_IMPLEMENTATION.md` — embeddable booking widget
- `ROLE_SYSTEM_UPDATE.md` — dual client/provider accounts
- `plan.md` — team booking scope
