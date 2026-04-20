# Project scope — Freelancer Marketplace

This document defines the **boundary** of this repository so it stays separate from ecommerce or other product types.

## In scope (included)

- User roles: **employer** and **job_seeker**
- **Jobs**: create, list, search, filter, view details
- **Applications**: apply, status tracking, employer review
- **Resumes**: upload (with production limitations documented in `DEPLOYMENT.md`)
- **Auth**: JWT register, login, protected routes
- **Email**: optional notifications (Nodemailer)

## Out of scope (not included — not ecommerce)

This project does **not** implement and should **not** be merged with:

- Product catalogs, SKUs, inventory
- Shopping cart or basket
- Checkout, payments, orders (Stripe/PayPal as a **store**)
- Shipping, fulfillment, refunds as a retail flow

If you need ecommerce, use a **different repository** and keep APIs, database, and deployment separate from this job portal.

## Naming note

“Marketplace” here means **labor / freelance work** (like a job board), not a **goods** marketplace.
