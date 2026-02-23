# Specification

## Summary
**Goal:** Build a receipt and payment tracking app for service-sector businesses with authenticated, per-user data, core receipt/payment workflows, searchable receipt management, printable receipts, and a consistent professional theme.

**Planned changes:**
- Add Internet Identity sign-in/sign-out and scope all data access to the authenticated principal.
- Implement backend (single Motoko actor) data models and CRUD for business profile, customers, service items, receipts (with line items and persisted totals), and payments linked to receipts.
- Build UI to create/edit/view receipts: select customer, add/remove line items, and calculate totals in real time before saving.
- Add UI to record multiple payments per receipt (Cash/Card/Bank Transfer/Other), update balance and status (Unpaid/Partially Paid/Paid), and allow deleting payments with recalculation.
- Create receipt list page with key columns plus search (receipt number/customer) and filters (status/date/customer).
- Add a print-friendly receipt view with business header, receipt details, line items, totals, and payment summary.
- Apply a coherent, business-oriented visual theme (non-default blue/purple) across navigation, forms, lists, and receipt views.
- Generate and include static image assets under `frontend/public/assets/generated` and render at least one in the UI (e.g., landing/empty states), served as static frontend assets.

**User-visible outcome:** Users can sign in with Internet Identity, manage their own customers/service items/receipts, record and adjust payments to track balances and statuses, search and filter receipts, and print clean receipts with business/customer details and payment summary.
