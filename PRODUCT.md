# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the owner, keeping their own finances. Used mostly on a desktop computer, with longer sessions for recording, importing statements and reviewing. The phone is secondary and the layout still has to work on it. Data marked "Shared" is money the owner shares with someone else, but only the owner uses the app.

## Product Purpose

A private personal-finance ledger. It records income, expenses and transfers across every account the owner holds. The question it must answer best is **"where is all my money right now?"**: balances across accounts, net worth, the investment portfolio, and money owed to or by the owner.

Budget tracking by category is a secondary job. The app succeeds when the owner trusts that the numbers match reality and can see their whole financial position at a glance.

## Positioning

Built for exactly one person's real accounts and habits, not for a market. It combines several things that generic trackers split across separate apps:

- the ledger
- shared-versus-personal accounting
- debtors (money paid on someone's behalf)
- a portfolio with Modified-Dietz returns and asset switches
- payroll splitting from salary slips
- AI-assisted import of Thai bank statements

## Operating Context

- **Recording:** transactions are entered by hand, or imported from PDF bank statements and salary slips through the Gemini API. Imports are reviewed row by row before they are saved.
- **Structure:** accounts are grouped and ordered by the owner. Credit cards have billing cycles and a Bill Pay flow. Budgets exist only at parent-category level.
- **Periods:** views switch between month, quarter and year.
- **Language:** the interface is bilingual, Thai and English. The currency is Thai baht.
- **Backup:** full backup and restore through XLSX/CSV.

## Capabilities and Constraints

- **Delivery:** a single file, `index.html`, in vanilla HTML/CSS/JS, with no build step. It is deployed by pushing `main` to GitHub Pages.
- **Storage:** `localStorage` is the working copy. It syncs to one gzip-packed Firestore document (`users/{uid}/data/fintrack`). On non-HTTPS it runs offline only.
- **Access:** Google sign-in plus an email allowlist. Firestore Security Rules are the real boundary. The repo is public, so nothing may rely on the source being secret.
- **Schema:** schema migrations are versioned (currently v20).
- **Terminology:**
  - "Shared" / "Personal" ("ส่วนตัว"). Do not use "Not shared", "Own" or "Joint".
  - "Transfer" is a transaction type, not a category.
  - "Financing" is a system parent category that can carry a budget.

## Brand Commitments

- The name is **LEDGER**.
- A monochrome, Apple-style interface, with only Dark and Light themes. This was confirmed on 2026-09-26.
- Colour carries meaning only:
  - green for income or within budget
  - red for expense or over budget
  - amber for near the limit
  - blue only for "Transfer"
- The copy is plain and bilingual.

## Evidence on Hand

- The data is the owner's real finances. Never create demo or mock data inside the real dataset, because it corrupts Analytics and Net Worth.
- There are no users, testimonials or metrics beyond the owner. Do not invent any.

## Product Principles

1. **The whole position first.** Every screen should help answer "where is my money?", with totals that reconcile across accounts, assets and debts.
2. **Trust over speed.** A save or sync that fails must be visible, and imports are reviewed before they commit. Silent data loss is the worst failure.
3. **Desktop-first, phone-safe.** Optimise for longer desk sessions: density, keyboard use, scanning. Keep every flow usable on a phone.
4. **One owner's reality.** Model the owner's actual accounts, cards, payroll and shared arrangements precisely, rather than generic abstractions.
5. **Meaning, not decoration.** Colour and emphasis mark financial status. Everything else stays quiet.

## Accessibility & Inclusion

Bilingual Thai/English throughout. Keep keyboard operability, visible focus, WCAG AA contrast in both themes, and `prefers-reduced-motion` support. No other specific requirement has been established.
